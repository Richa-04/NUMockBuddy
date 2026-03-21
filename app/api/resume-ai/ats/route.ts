import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { resumeText, userId, fileName } = await req.json();
    if (!resumeText) return NextResponse.json({ error: "Resume text required" }, { status: 400 });

    const prompt = `You are a real ATS system (Taleo, Workday, Greenhouse combined). Parse and analyze this resume exactly as each ATS would. Only report what you can directly observe.

RESUME TEXT:
${resumeText}

Return ONLY this JSON:
{
  "overallScore": 0-100,
  "verdict": "Likely parseable"|"Needs fixes"|"High risk",
  "scoreExplanation": "one sentence: exactly why this score, what specific issues caused point deductions",
  "projectedScore": 0-100,
  "projectedScoreNote": "Fix [specific issue 1] and [specific issue 2] → estimated score: [projectedScore]",
  "atsSystems": {
    "taleo": "pass"|"warn"|"fail",
    "workday": "pass"|"warn"|"fail",
    "greenhouse": "pass"|"warn"|"fail"
  },
  "atsSystemDetails": {
    "taleo": "specific explanation of what Taleo struggles with in THIS resume",
    "workday": "specific explanation of what Workday struggles with in THIS resume",
    "greenhouse": "specific explanation of what Greenhouse struggles with in THIS resume"
  },
  "isMultiColumn": true|false,
  "checks": [
    { "name": "File Format", "status": "pass"|"warn"|"fail", "note": "one line" },
    { "name": "Section Headers", "status": "pass"|"warn"|"fail", "note": "one line" },
    { "name": "Contact Info", "status": "pass"|"warn"|"fail", "note": "one line" },
    { "name": "Multi-column Layout", "status": "pass"|"warn"|"fail", "note": "one line" },
    { "name": "Bullet Point Format", "status": "pass"|"warn"|"fail", "note": "one line" },
    { "name": "Date Format", "status": "pass"|"warn"|"fail", "note": "one line" },
    { "name": "Special Characters", "status": "pass"|"warn"|"fail", "note": "one line" },
    { "name": "Tables Detected", "status": "pass"|"warn"|"fail", "note": "one line" },
    { "name": "Keyword Density", "status": "pass"|"warn"|"fail", "note": "one line" },
    { "name": "Line Length", "status": "pass"|"warn"|"fail", "note": "one line" },
    { "name": "Verb Tense", "status": "pass"|"warn"|"fail", "note": "one line" },
    { "name": "Section Order", "status": "pass"|"warn"|"fail", "note": "one line" }
  ],
  "detectedSections": ["Education", "Experience"],
  "missingSections": [
    { "name": "Summary", "importance": "Optional for SWE", "why": "one line why" }
  ],
  "contactFields": {
    "name": true,
    "email": true,
    "phone": true,
    "linkedin": true,
    "github": true
  },
  "quickFixChecklist": [
    { "id": 1, "action": "specific fix from this resume", "effort": "2 min"|"5 min"|"10 min", "impact": "high"|"medium"|"low", "scoreGain": "+3 pts" },
    { "id": 2, "action": "...", "effort": "...", "impact": "...", "scoreGain": "..." },
    { "id": 3, "action": "...", "effort": "...", "impact": "...", "scoreGain": "..." }
  ],
  "severityIssues": [
    { "severity": "high"|"medium"|"low", "issue": "description", "fix": "how to fix" }
  ],
  "parseSimulation": {
    "garbled": "show exactly how ATS scrambles a problematic section from THIS resume (2-3 lines)",
    "clean": "show the same section formatted correctly as clean single-column text"
  }
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (response.content[0] as { text: string }).text;
    const result = JSON.parse(raw.replace(/```json|```/g, "").trim());

    try {
      await prisma.resumeScan.create({
        data: {
          userId: userId ?? "anonymous",
          score: result.overallScore,
          scanType: "ATS",
          issuesFound: result.severityIssues || [],
          resumeSnippet: resumeText.slice(0, 300),
          fileName: fileName ?? null,
        },
      });
    } catch { /* DB offline, skip */ }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "ATS scan failed" }, { status: 500 });
  }
}
