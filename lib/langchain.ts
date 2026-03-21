import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import fs from "fs";
import path from "path";

let vectorStore: MemoryVectorStore | null = null;

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: "text-embedding-3-small",
});

export async function getVectorStore(): Promise<MemoryVectorStore> {
  if (vectorStore) return vectorStore;

  const kbDir = path.join(process.cwd(), "data", "knowledge-base");
  const files = fs.readdirSync(kbDir).filter((f) => f.endsWith(".txt") || f.endsWith(".md"));

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const docs: Document[] = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(kbDir, file), "utf-8");
    const chunks = await splitter.createDocuments([content], [{ source: file }]);
    docs.push(...chunks);
  }

  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  return vectorStore;
}

export async function retrieveContext(query: string, k = 3): Promise<string> {
  const store = await getVectorStore();
  const results = await store.similaritySearch(query, k);
  return results.map((doc) => doc.pageContent).join("\n\n---\n\n");
}

export async function semanticKeywordMatch(
  jdPhrases: string[],
  resumeText: string,
  threshold = 0.72
): Promise<{ phrase: string; matched: boolean; similarity: number }[]> {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 20 });
  const resumeChunks = await splitter.createDocuments([resumeText]);
  const resumeStore = await MemoryVectorStore.fromDocuments(resumeChunks, embeddings);

  const results = [];
  for (const phrase of jdPhrases) {
    const similar = await resumeStore.similaritySearchWithScore(phrase, 1);
    const score = similar[0]?.[1] ?? 0;
    results.push({ phrase, matched: score >= threshold, similarity: score });
  }
  return results;
}
