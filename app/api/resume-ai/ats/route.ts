import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { resumeText, userId } = await req.json();
    if (!resumeText) return NextResponse.json({ error: "Resume text required" }, { status: 400 });

    const prompt = `You are a real ATS system (like Taleo, Workday, Greenhouse combined). Parse and analyze this resume exactly as an ATS would. Only report what you can directly observe in the text.

RESUME TEXT:
${resumeText}

Return ONLY this JSON:
{
  "overallScore": 0-100,
  "verdict": "Likely parseable" | "Needs fixes" | "High risk",
  "atsSystems": {
    "taleo": "pass" | "warn" | "fail",
    "workday": "pass" | "warn" | "fail",
    "greenhouse": "pass" | "warn" | "fail"
  },
  "isMultiColumn": true | false,
  "checks": [
    { "name": "File Format", "status": "pass" | "warn" | "fail", "note": "one line" },
    { "name": "Section Headers", "status": "pass" | "warn" | "fail", "note": "one line" },
    { "name": "Contact Info", "status": "pass" | "warn" | "fail", "note": "one line" },
    { "name": "Multi-column Layout", "status": "pass" | "warn" | "fail", "note": "one line" },
    { "name": "Bullet Point Format", "status": "pass" | "warn" | "fail", "note": "one line" },
    { "name": "Date Format", "status": "pass" | "warn" | "fail", "note": "one line" },
    { "name": "Special Characters", "status": "pass" | "warn" | "fail", "note": "one line" },
    { "name": "Tables Detected", "status": "pass" | "warn" | "fail", "note": "one line" },
    { "name": "Keyword Density", "status": "pass" | "warn" | "fail", "note": "one line" },
    { "name": "Line Length", "status": "pass" | "warn" | "fail", "note": "one line" },
    { "name": "Verb Tense", "status": "pass" | "warn" | "fail", "note": "one line" },
    { "name": "Section Order", "status": "pass" | "warn" | "fail", "note": "one line" }
  ],
  "detectedSections": ["Experience", "Education", ...],
  "missingSections": ["Summary", ...],
  "contactFields": {
    "name": true | false,
    "email": true | false,
    "phone": true | false,
    "linkedin": true | false,
    "github": true | false
  },
  "severityIssues": [
    { "severity": "high" | "medium" | "low", "issue": "description", "fix": "how to fix" }
  ],
  "parseSimulation": {
    "garbled": "show how ATS would garble a problematic section (2-3 lines)",
    "clean": "show how it should look (2-3 lines)"
  }
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (response.content[0] as { text: string }).text;
    const result = JSON.parse(raw.replace(/```json|```/g, "").trim());

    await prisma.resumeScan.create({
      data: {
        userId: userId ?? "anonymous",
        score: result.overallScore,
        scanType: "ATS",
        issuesFound: result.severityIssues || [],
        resumeSnippet: resumeText.slice(0, 300),
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "ATS scan failed" }, { status: 500 });
  }
}
