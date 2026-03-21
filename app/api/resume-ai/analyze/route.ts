import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { semanticKeywordMatch } from "@/lib/langchain";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const HALLUCINATION_GUARD = `Base your analysis strictly on the text provided. Do not add, infer, or suggest any keywords, skills, tools, companies, or requirements that do not appear explicitly in the input text.`;

const STRONG_VERBS = [
  "architected","designed","built","authored","led","launched","founded","created",
  "developed","engineered","implemented","delivered","drove","owned","directed",
  "established","pioneered","transformed","scaled","optimized","accelerated",
  "spearheaded","championed","orchestrated","executed","deployed","shipped",
  "managed","coordinated","mentored","trained","negotiated","secured","achieved",
  "reduced","increased","improved","generated","saved","produced","streamlined",
  "automated","migrated","refactored","integrated","analyzed","researched",
  "presented","published","awarded","promoted","graduated","completed","earned"
];

const BUZZWORDS = [
  "passionate","detail-oriented","team player","hard worker","go-getter","self-starter",
  "dynamic","synergy","leverage","utilize","innovative","results-driven","motivated",
  "proactive","strategic thinker","thought leader","guru","ninja","wizard","rockstar",
  "seamless","robust","cutting-edge","fast-paced","outside the box","value-add"
];

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jdText, role, mode, userId, fileName } = await req.json();
    if (!resumeText) return NextResponse.json({ error: "Resume text required" }, { status: 400 });

    const wordCount = resumeText.split(/\s+/).length;
    const estimatedPages = wordCount > 700 ? "2 pages" : "1 page";
    const lineCount = resumeText.split('\n').filter((l: string) => l.trim()).length;

    let result: Record<string, unknown> = {};

    if (mode === "jd" && jdText) {
      const kwResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: `Extract all technical skills, tools, frameworks, certifications, and role-specific keywords from this JD. Return ONLY JSON:
{
  "required": [...],
  "preferred": [...],
  "yearsRequired": "3+ years" or null,
  "educationRequired": "BS/MS" or null,
  "certifications": [...],
  "seniorityLevel": "intern"|"junior"|"mid"|"senior"|"lead",
  "roleTitle": "...",
  "industry": "fintech"|"healthcare"|"SaaS"|"enterprise"|"other"
}
JD: ${jdText}`
        }],
      });

      let jdParsed = { required: [] as string[], preferred: [] as string[], yearsRequired: null as string | null, educationRequired: null as string | null, certifications: [] as string[], seniorityLevel: "mid", roleTitle: "", industry: "other" };
      try {
        const raw = (kwResponse.content[0] as { text: string }).text;
        jdParsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch { jdParsed.required = []; }

      const allJdKeywords = [...jdParsed.required, ...jdParsed.preferred];
      const matchedKeywords: string[] = [];
      let missingKeywords: string[] = [];

      for (const kw of allJdKeywords) {
        if (resumeText.toLowerCase().includes(kw.toLowerCase())) matchedKeywords.push(kw);
        else missingKeywords.push(kw);
      }

      let semanticMatches: string[] = [];
      if (missingKeywords.length > 0) {
        const semanticResults = await semanticKeywordMatch(missingKeywords, resumeText, 0.72);
        semanticMatches = semanticResults.filter(r => r.matched).map(r => r.phrase);
        missingKeywords = missingKeywords.filter(k => !semanticMatches.includes(k));
      }

      const matchScore = Math.round(((matchedKeywords.length + semanticMatches.length * 0.7) / Math.max(allJdKeywords.length, 1)) * 100);

      const deepResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        messages: [{
          role: "user",
          content: `${HALLUCINATION_GUARD}

You are an expert ATS and resume analyst. Analyze this resume against the JD.

RESUME: ${resumeText}
JD: ${jdText}
JD METADATA: Seniority: ${jdParsed.seniorityLevel}, Years: ${jdParsed.yearsRequired}, Role: ${jdParsed.roleTitle}, Industry: ${jdParsed.industry}
ESTIMATED PAGES: ${estimatedPages} (${wordCount} words, ${lineCount} lines)

STRONG VERBS — NEVER flag these as weak: ${STRONG_VERBS.join(", ")}
BUZZWORDS to check for: ${BUZZWORDS.join(", ")}

Return ONLY this JSON:
{
  "atsProbability": 0-100,
  "atsProbabilityExplanation": "exact reason and what would make it 100%",
  "seniorityMatch": "strong"|"partial"|"weak",
  "seniorityNote": "one line",
  "senioritySignal": "Your resume reads as [level]. For [role], [specific advice].",
  "experienceYearsMatch": true|false,
  "experienceNote": "one line",
  "educationMatch": true|false|"not required",
  "domainMatch": "strong"|"partial"|"weak",
  "domainNote": "one line",
  "industryKeywordDensity": "strong"|"moderate"|"weak",
  "industryKeywordNote": "one line",
  "resumeLength": "${estimatedPages}",
  "hasGPA": true|false,
  "hasGitHub": true|false,
  "hasLinkedIn": true|false,
  "impactScore": 0-100,
  "impactNote": "X of Y bullets are quantified",
  "achievementRatio": "mostly achievements"|"mixed"|"mostly responsibilities",
  "achievementNote": "one line",
  "bulletLengthIssues": ["bullet that is too long or too vague"],
  "buzzwordsFound": ["buzzword found in resume from the list above"],
  "weakVerbs": ["ONLY verbs NOT in strong verbs list — like helped, worked on, assisted, supported"],
  "repeatedVerbs": ["verb used 3+ times"],
  "missingMetrics": ["specific bullet missing numbers"],
  "firstPersonIssues": true|false,
  "tenseMixing": true|false,
  "dateConsistency": "consistent"|"inconsistent",
  "dateNote": "one line",
  "sectionOrder": "correct"|"needs adjustment",
  "sectionOrderNote": "one line",
  "densityScore": "well-spaced"|"too dense"|"too sparse",
  "strongestBullets": ["top 3 actual bullets from resume"],
  "quickWins": [
    {"action": "specific change", "effort": "5 min"|"10 min"|"15 min", "impact": "high"|"medium"},
    {"action": "...", "effort": "...", "impact": "..."},
    {"action": "...", "effort": "...", "impact": "..."}
  ],
  "topImprovements": ["improvement 1", "improvement 2", "improvement 3"],
  "rewriteSuggestions": ["rewrite 1", "rewrite 2", "rewrite 3"],
  "formattingIssues": ["issue 1"],
  "leadershipSignals": "strong"|"moderate"|"weak"|"none",
  "impactVsResponsibility": "mostly impact"|"mixed"|"mostly responsibility"
}`
        }],
      });

      let deepResult: Record<string, unknown> = {};
      try {
        const raw = (deepResponse.content[0] as { text: string }).text;
        deepResult = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch { deepResult = {}; }

      deepResult.resumeLength = estimatedPages;

      result = {
        score: matchScore,
        matchedKeywords,
        missingKeywords: missingKeywords.slice(0, 20),
        semanticMatches,
        requiredKeywords: jdParsed.required,
        preferredKeywords: jdParsed.preferred,
        suggestions: deepResult.rewriteSuggestions || [],
        ...deepResult,
      };

    } else if (mode === "role" && role) {
      const roleResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        messages: [{
          role: "user",
          content: `${HALLUCINATION_GUARD}

You are an expert resume analyst. Analyze this resume for the role of ${role}. Be REALISTIC — average scores are 55-70. Only give 80+ for genuinely exceptional resumes.

RESUME: ${resumeText}
ESTIMATED PAGES: ${estimatedPages} (${wordCount} words, ${lineCount} lines)

STRONG VERBS — NEVER flag these as weak: ${STRONG_VERBS.join(", ")}
BUZZWORDS to check for: ${BUZZWORDS.join(", ")}

Return ONLY this JSON:
{
  "overallScore": 0-100,
  "atsProbability": 0-100,
  "atsProbabilityExplanation": "exact reason and what would make it 100%",
  "scores": {
    "technical": 0-100,
    "impact": 0-100,
    "keywords": 0-100,
    "devops": 0-100,
    "leadership": 0-100
  },
  "senioritySignal": "Your resume reads as [level]. For ${role}, [specific advice].",
  "industryKeywordDensity": "strong"|"moderate"|"weak",
  "industryKeywordNote": "one line",
  "resumeLength": "${estimatedPages}",
  "hasGPA": true|false,
  "hasGitHub": true|false,
  "hasLinkedIn": true|false,
  "impactScore": 0-100,
  "impactNote": "X of Y bullets are quantified",
  "achievementRatio": "mostly achievements"|"mixed"|"mostly responsibilities",
  "achievementNote": "one line",
  "bulletLengthIssues": ["bullet that is too long or too vague"],
  "buzzwordsFound": ["buzzword found in resume from the list above"],
  "weakVerbs": ["ONLY genuinely weak verbs NOT in whitelist"],
  "repeatedVerbs": ["verb used 3+ times"],
  "missingMetrics": ["bullet missing numbers"],
  "firstPersonIssues": true|false,
  "tenseMixing": true|false,
  "dateConsistency": "consistent"|"inconsistent",
  "dateNote": "one line",
  "sectionOrder": "correct"|"needs adjustment",
  "sectionOrderNote": "one line",
  "densityScore": "well-spaced"|"too dense"|"too sparse",
  "strongestBullets": ["top 3 actual bullets"],
  "quickWins": [
    {"action": "specific change", "effort": "5 min"|"10 min"|"15 min", "impact": "high"|"medium"},
    {"action": "...", "effort": "...", "impact": "..."},
    {"action": "...", "effort": "...", "impact": "..."}
  ],
  "topImprovements": ["improvement 1", "improvement 2", "improvement 3"],
  "rewriteSuggestions": ["rewrite 1", "rewrite 2", "rewrite 3"],
  "formattingIssues": ["issue 1"],
  "leadershipSignals": "strong"|"moderate"|"weak"|"none",
  "impactVsResponsibility": "mostly impact"|"mixed"|"mostly responsibility",
  "domainStrengths": ["strength 1", "strength 2"]
}`
        }],
      });

      let roleResult: Record<string, unknown> = {};
      try {
        const raw = (roleResponse.content[0] as { text: string }).text;
        roleResult = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch { roleResult = {}; }

      roleResult.resumeLength = estimatedPages;

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

    try {
      await prisma.resumeScan.create({
        data: {
          userId: userId ?? "anonymous",
          score: (result.score as number) || 0,
          scanType: mode === "jd" ? "JD_MATCH" : "ROLE_RATE",
          issuesFound: (result.missingKeywords as string[]) || [],
          resumeSnippet: resumeText.slice(0, 300),
          improvements: (result.topImprovements as string[]) || [],
          fileName: fileName ?? null,
        },
      });
    } catch { /* DB offline, skip */ }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
