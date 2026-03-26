import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are MockMate, a friendly career assistant for Northeastern University students.
Help with resumes, cover letters, interview prep, co-op search, and networking.
Keep answers concise and practical — 2-4 sentences unless the student asks for more detail.
Only give advice based on what the student has shared.
Do not make up job details, company names, or resume content.
If the student pastes a resume or job description, only reference what is literally in that text.
You know about Northeastern's co-op program, Handshake, and the university's career resources.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages,
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Widget API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
