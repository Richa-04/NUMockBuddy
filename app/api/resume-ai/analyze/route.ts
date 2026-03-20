import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { semanticKeywordMatch } from "@/lib/langchain";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const HALLUCINATION_GUARD = `Base your analysis strictly on the text provided. Do not add, infer, or suggest any keywords, skills, tools, companies, or requirements that do not appear explicitly in the input text. If something is not in the text, do not mention it.`;

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jdText, role, mode, userId } = await req.json();
    if (!resumeText) return NextResponse.json({ error: "Resume text required" }, { status: 400 });

    let result: Record<string, unknown> = {};

    if (mode === "jd" && jdText) {
      // Step 1: Extract JD keywords
      const kwResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: `Extract all technical skills, tools, frameworks, methodologies, certifications, and role-specific keywords from this job description. Also identify: required years of experience, education requirements, required certifications, whether the role is junior/mid/senior level, and split keywords into "required" vs "preferred".

Return ONLY a JSON object, no explanation:
{
  "required": ["keyword1", ...],
  "preferred": ["keyword1", ...],
  "yearsRequired": "3+ years" or null,
  "educationRequired": "BS/MS/PhD" or null,
  "certifications": ["AWS", ...] or [],
  "seniorityLevel": "junior" | "mid" | "senior" | "lead",
  "roleTitle": "Software Engineer" or similar
}

JD:
${jdText}`
        }],
      });

      let jdParsed: { required: string[], preferred: string[], yearsRequired: string | null, educationRequired: string | null, certifications: string[], seniorityLevel: string, roleTitle: string } = {
        required: [], preferred: [], yearsRequired: null, educationRequired: null, certifications: [], seniorityLevel: "mid", roleTitle: ""
      };
      try {
        const raw = (kwResponse.content[0] as { text: string }).text;
        jdParsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch { jdParsed.required = []; }

      const allJdKeywords = [...jdParsed.required, ...jdParsed.preferred];

      // Step 2: Exact match
      const matchedKeywords: string[] = [];
      let missingKeywords: string[] = [];
      for (const kw of allJdKeywords) {
        if (resumeText.toLowerCase().includes(kw.toLowerCase())) {
          matchedKeywords.push(kw);
        } else {
          missingKeywords.push(kw);
        }
      }

      // Step 3: Semantic match on missing
      let semanticMatches: string[] = [];
      if (missingKeywords.length > 0) {
        const semanticResults = await semanticKeywordMatch(missingKeywords, resumeText, 0.72);
        semanticMatches = semanticResults.filter(r => r.matched).map(r => r.phrase);
        missingKeywords = missingKeywords.filter(k => !semanticMatches.includes(k));
      }

      const matchScore = Math.round(
        ((matchedKeywords.length + semanticMatches.length * 0.7) / Math.max(allJdKeywords.length, 1)) * 100
      );

      // Step 4: Deep analysis
      const deepResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `${HALLUCINATION_GUARD}

You are an expert ATS system and resume analyst. Analyze this resume against the job description deeply.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

JD METADATA:
- Seniority: ${jdParsed.seniorityLevel}
- Years Required: ${jdParsed.yearsRequired || "not specified"}
- Education Required: ${jdParsed.educationRequired || "not specified"}
- Certifications Required: ${jdParsed.certifications.join(", ") || "none"}
- Role Title: ${jdParsed.roleTitle}

Analyze and return ONLY this JSON (no explanation):
{
  "atsProbability": 0-100,
  "seniorityMatch": "strong" | "partial" | "weak",
  "seniorityNote": "one line explanation",
  "experienceYearsMatch": true | false,
  "experienceNote": "one line",
  "educationMatch": true | false | "not required",
  "educationNote": "one line",
  "certificationMatch": true | false | "not required",
  "certificationNote": "one line",
  "domainMatch": "strong" | "partial" | "weak",
  "domainNote": "one line",
  "weakVerbs": ["verb from resume", ...],
  "missingMetrics": ["bullet that lacks numbers", ...],
  "firstPersonIssues": true | false,
  "tenseMixing": true | false,
  "resumeLength": "1 page" | "2 pages" | "too long",
  "hasGPA": true | false,
  "hasGitHub": true | false,
  "hasLinkedIn": true | false,
  "strongestBullets": ["top 3 actual bullets from resume"],
  "topImprovements": ["specific actionable improvement 1", "improvement 2", "improvement 3"],
  "rewriteSuggestions": ["rewrite suggestion 1", "rewrite suggestion 2", "rewrite suggestion 3"],
  "formattingIssues": ["issue 1", ...],
  "leadershipSignals": "strong" | "moderate" | "weak" | "none",
  "impactVsResponsibility": "mostly impact" | "mixed" | "mostly responsibility"
}`
        }],
      });

      let deepResult: Record<string, unknown> = {};
      try {
        const raw = (deepResponse.content[0] as { text: string }).text;
        deepResult = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch { deepResult = {}; }

      result = {
        score: matchScore,
        matchedKeywords,
        missingKeywords: missingKeywords.slice(0, 20),
        semanticMatches,
        requiredKeywords: jdParsed.required,
        preferredKeywords: jdParsed.preferred,
        ...deepResult,
        suggestions: deepResult.rewriteSuggestions || [],
      };

    } else if (mode === "role" && role) {
      const roleResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `${HALLUCINATION_GUARD}

You are an expert resume analyst and ATS system. Analyze this resume for the role of ${role}.

RESUME:
${resumeText}

Analyze deeply and return ONLY this JSON:
{
  "overallScore": 0-100,
  "atsProbability": 0-100,
  "scores": {
    "technical": 0-100,
    "impact": 0-100,
    "keywords": 0-100,
    "devops": 0-100,
    "leadership": 0-100
  },
  "weakVerbs": ["verb from resume", ...],
  "missingMetrics": ["bullet that lacks numbers", ...],
  "firstPersonIssues": true | false,
  "tenseMixing": true | false,
  "resumeLength": "1 page" | "2 pages" | "too long",
  "hasGPA": true | false,
  "hasGitHub": true | false,
  "hasLinkedIn": true | false,
  "strongestBullets": ["top 3 actual bullets from resume"],
  "topImprovements": ["specific improvement 1", "improvement 2", "improvement 3"],
  "rewriteSuggestions": ["rewrite suggestion 1", "rewrite suggestion 2", "rewrite suggestion 3"],
  "formattingIssues": ["issue 1", ...],
  "leadershipSignals": "strong" | "moderate" | "weak" | "none",
  "impactVsResponsibility": "mostly impact" | "mixed" | "mostly responsibility",
  "seniorityLevel": "junior" | "mid" | "senior",
  "domainStrengths": ["strength 1", "strength 2"]
}`
        }],
      });

      let roleResult: Record<string, unknown> = {};
      try {
        const raw = (roleResponse.content[0] as { text: string }).text;
        roleResult = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch { roleResult = {}; }

      result = {
        score: roleResult.overallScore || 0,
        bars: roleResult.scores || {},
        suggestions: roleResult.rewriteSuggestions || [],
        matchedKeywords: [],
        missingKeywords: [],
        semanticMatches: [],
        ...roleResult,
      };
    }

    await prisma.resumeScan.create({
      data: {
        userId: userId ?? "anonymous",
        score: (result.score as number) || 0,
        scanType: mode === "jd" ? "JD_MATCH" : "ROLE_RATE",
        issuesFound: (result.missingKeywords as string[]) || [],
        resumeSnippet: resumeText.slice(0, 300),
        improvements: (result.topImprovements as string[]) || [],
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
