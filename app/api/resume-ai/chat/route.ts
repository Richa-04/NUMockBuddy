import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { retrieveContext } from "@/lib/langchain";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId, userId, newSession, title, fileContent, fileName } = await req.json();

    let session: { id: string } | null = null;

    try {
      if (newSession) {
        session = await prisma.chatSession.create({
          data: { userId: userId ?? "anonymous", title: title ?? "New Chat" },
        });
      } else {
        session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
      }
    } catch {
      session = { id: sessionId || "offline-session" };
    }

    const lastUserMessage = messages[messages.length - 1]?.content ?? "";
    const ragContext = await retrieveContext(lastUserMessage, 3);

    let fileContext = "";
    if (fileContent && fileName) {
      fileContext = `\n\nATTACHED FILE: ${fileName}\n---\n${fileContent}\n---\n`;
    }

    const systemPrompt = `You are NUMockBuddy, a career assistant for Northeastern University students. Help with resume writing, cover letters, outreach messages, and interview prep.

IMPORTANT BEHAVIOR:
- Users may respond in template format (filling in your structured questions) OR in natural conversational form — handle both equally well
- If a user gives a natural response like "I am targeting Google SWE roles, I am a CS student" treat it exactly the same as if they filled in your template
- Never re-ask questions the user has already answered, even informally
- Extract information from however the user phrases it and proceed with the task
- Keep responses concise and actionable — avoid long bullet lists when a paragraph works better
- Only give advice grounded in what the student has shared or what is in the retrieved context
- Do not fabricate job details, company information, or resume content

RETRIEVED CONTEXT (Northeastern-specific career guidance):
${ragContext}${fileContext}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      tools: [{ type: "web_search_20250305" as const, name: "web_search" }],
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role, content: m.content,
      })),
    });

    const assistantContent = response.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("\n");

    try {
      const userMsg = messages[messages.length - 1];
      await prisma.chatMessage.createMany({
        data: [
          { sessionId: session!.id, role: "USER", content: userMsg.content },
          { sessionId: session!.id, role: "ASSISTANT", content: assistantContent },
        ],
      });
    } catch { /* DB offline, skip saving */ }

    return NextResponse.json({ reply: assistantContent, sessionId: session?.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") ?? "anonymous";
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json([]);
  }
}
