"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { lookupATS } from "@/lib/ats-companies";

type Tab = "jd" | "ats" | "chat";
type Mode = "jd" | "role";

interface AnalysisResult {
  score: number;
  atsProbability?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  semanticMatches?: string[];
  requiredKeywords?: string[];
  preferredKeywords?: string[];
  suggestions?: string[];
  bars?: Record<string, number>;
  weakVerbs?: string[];
  missingMetrics?: string[];
  firstPersonIssues?: boolean;
  tenseMixing?: boolean;
  resumeLength?: string;
  hasGPA?: boolean;
  hasGitHub?: boolean;
  hasLinkedIn?: boolean;
  strongestBullets?: string[];
  topImprovements?: string[];
  formattingIssues?: string[];
  leadershipSignals?: string;
  impactVsResponsibility?: string;
  seniorityMatch?: string;
  seniorityNote?: string;
  experienceYearsMatch?: boolean;
  experienceNote?: string;
  educationMatch?: boolean | string;
  educationNote?: string;
  domainMatch?: string;
  domainNote?: string;
}

interface ATSCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  note: string;
}

interface SeverityIssue {
  severity: "high" | "medium" | "low";
  issue: string;
  fix: string;
}

interface ATSResult {
  overallScore: number;
  verdict: string;
  isMultiColumn: boolean;
  checks: ATSCheck[];
  atsSystems?: Record<string, string>;
  detectedSections?: string[];
  missingSections?: string[];
  contactFields?: Record<string, boolean>;
  severityIssues?: SeverityIssue[];
  parseSimulation?: { garbled: string; clean: string };
}

interface ScanRecord {
  id: string;
  score: number;
  createdAt: string;
  scanType: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: { role: string; content: string }[];
}

interface AttachedFile {
  name: string;
  content: string;
  type: string;
}

const ROLES = ["Software Engineer", "Product Manager", "Data Engineer", "ML Engineer", "Solutions Architect"];

const QUICK_CHIPS = [
  { label: "✍️ Write a cover letter", prompt: "I need help writing a cover letter. Can you help me get started?" },
  { label: "💪 Strengthen bullet points", prompt: "I want to strengthen my resume bullet points. Can you help?" },
  { label: "📨 Outreach message", prompt: "I need to write a LinkedIn outreach message to a recruiter. Can you help?" },
  { label: "🎯 Interview prep", prompt: "I have an upcoming interview. Can you help me prepare?" },
  { label: "🔍 Find resume gaps", prompt: "Can you help me find gaps or weaknesses in my resume?" },
  { label: "💼 Rewrite LinkedIn", prompt: "I want to rewrite my LinkedIn summary. Can you help?" },
];

const WEAK_VERB_REPLACEMENTS: Record<string, string[]> = {
  "helped": ["accelerated", "drove", "enabled", "facilitated"],
  "worked on": ["engineered", "built", "delivered", "shipped"],
  "assisted": ["spearheaded", "championed", "led", "owned"],
  "supported": ["optimized", "streamlined", "enhanced", "strengthened"],
  "handled": ["orchestrated", "executed", "directed", "managed"],
  "did": ["achieved", "accomplished", "delivered", "produced"],
  "made": ["architected", "designed", "created", "developed"],
  "used": ["leveraged", "implemented", "deployed", "utilized"],
  "worked with": ["collaborated with", "partnered with", "coordinated"],
  "responsible for": ["owned", "led", "directed", "oversaw"],
};

function getLetterGrade(score: number): { grade: string; color: string; bg: string } {
  if (score >= 90) return { grade: "A+", color: "#16a34a", bg: "bg-green-50 dark:bg-green-950" };
  if (score >= 80) return { grade: "A", color: "#16a34a", bg: "bg-green-50 dark:bg-green-950" };
  if (score >= 70) return { grade: "B+", color: "#2563eb", bg: "bg-gray-50 dark:bg-gray-900" };
  if (score >= 60) return { grade: "B", color: "#2563eb", bg: "bg-gray-50 dark:bg-gray-900" };
  if (score >= 50) return { grade: "C+", color: "#ca8a04", bg: "bg-yellow-50 dark:bg-yellow-950" };
  if (score >= 40) return { grade: "C", color: "#ca8a04", bg: "bg-yellow-50 dark:bg-yellow-950" };
  return { grade: "D", color: "#dc2626", bg: "bg-red-50 dark:bg-red-950" };
}

function ScoreGauge({ score, label }: { score: number; label?: string }) {
  const { grade, color } = getLetterGrade(score);
  const r = 48;
  const circ = 2 * Math.PI * r;
  const half = circ / 2;
  const fill = (score / 100) * half;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="130" height="75" viewBox="0 0 130 75">
        <path d="M 15 70 A 50 50 0 0 1 115 70" fill="none" stroke="#2a2a2a" strokeWidth="10" strokeLinecap="round" />
        <path d="M 15 70 A 50 50 0 0 1 115 70" fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${fill} ${half}`} />
      </svg>
      <div className="flex items-end gap-2 -mt-10">
        <span className="text-3xl font-black leading-none" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-500 mb-1">/100</span>
        <span className="text-lg font-black leading-none px-2 py-0.5 rounded-lg mb-0.5" style={{ color, background: `${color}20` }}>{grade}</span>
      </div>
      {label && <p className="text-xs text-gray-400">{label}</p>}
    </div>
  );
}

function CategoryCard({ title, score, icon, children }: { title: string; score?: number; icon: string; children?: React.ReactNode }) {
  const color = score !== undefined ? (score >= 75 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#dc2626") : "#6b7280";
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{title}</p>
        </div>
        {score !== undefined && (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
            </div>
            <span className="text-xs font-bold" style={{ color }}>{score}</span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function IssueBadge({ level }: { level: "critical" | "improve" | "nice" }) {
  const styles = {
    critical: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    improve: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
    nice: "bg-gray-100 text-[#C8102E] dark:bg-gray-900 dark:text-gray-300",
  };
  const labels = { critical: "Critical", improve: "Improve", nice: "Nice to have" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${styles[level]}`}>{labels[level]}</span>;
}

function WeakVerbCard({ verb }: { verb: string }) {
  const replacements = WEAK_VERB_REPLACEMENTS[verb.toLowerCase()] || ["strengthen", "drive", "lead", "build"];
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-orange-100 dark:border-orange-900 bg-orange-50 dark:bg-orange-950">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2 py-0.5 bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded text-xs font-mono font-bold line-through">{verb}</span>
          <span className="text-orange-400 text-xs">→ try</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {replacements.map((r) => (
            <span key={r} className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 rounded text-xs font-semibold">{r}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScanTimeline({ scans }: { scans: ScanRecord[] }) {
  if (!scans.length) return null;
  return (
    <div className="mt-2 pt-5 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Progress Timeline</p>
      <div className="flex items-center gap-3 flex-wrap">
        {scans.map((s, i) => {
          const { grade, color } = getLetterGrade(s.score);
          return (
            <div key={s.id} className="flex items-center gap-3">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-white shadow-sm font-bold"
                  style={{ background: color }}>
                  <span className="text-xs">{grade}</span>
                  <span className="text-xs">{s.score}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              {i < scans.length - 1 && (
                <div className="flex flex-col items-center">
                  <div className="h-px w-6 bg-gray-300 dark:bg-gray-700" />
                  {scans[i + 1].score > s.score && (
                    <span className="text-xs text-green-600 font-bold">+{scans[i + 1].score - s.score}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <span className="text-red-500 font-bold text-xs">PDF</span>;
  if (ext === "docx" || ext === "doc") return <span className="text-gray-400 font-bold text-xs">DOC</span>;
  return <span className="text-gray-500 font-bold text-xs">TXT</span>;
}

export default function ResumeAIPage() {
  const [activeTab, setActiveTab] = useState<Tab>("jd");
  const [darkMode, setDarkMode] = useState(true);
  const userId = "demo-user";

  // Tab 1
  const [mode, setMode] = useState<Mode>("jd");
  const [resumeFile, setResumeFile] = useState<{ name: string; content: string } | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [company, setCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [tab1History, setTab1History] = useState<ScanRecord[]>([]);
  const atsInfo = company ? lookupATS(company) : null;

  // Tab 2
  const [atsResumeFile, setAtsResumeFile] = useState<{ name: string; content: string } | null>(null);
  const [atsResumeText, setAtsResumeText] = useState("");
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [atsScanning, setAtsScanning] = useState(false);
  const [showAtsGood, setShowAtsGood] = useState(false);
  const [tab2History, setTab2History] = useState<ScanRecord[]>([]);

  // Tab 3
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async (scanType: string, setter: (s: ScanRecord[]) => void) => {
    const res = await fetch(`/api/resume-ai/history?userId=${userId}&scanType=${scanType}`);
    setter(await res.json());
  }, [userId]);

  const loadSessions = useCallback(async () => {
    const res = await fetch(`/api/resume-ai/chat?userId=${userId}`);
    setSessions(await res.json());
  }, [userId]);

  useEffect(() => {
    loadHistory("JD_MATCH", setTab1History);
    loadSessions();
  }, [loadHistory, loadSessions]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const parseFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/resume-ai/parse", { method: "POST", body: formData });
    const data = await res.json();
    return data.text || "";
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await parseFile(file);
    setResumeFile({ name: file.name, content });
  };

  const handleAtsResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await parseFile(file);
    setAtsResumeFile({ name: file.name, content });
  };

  const handleChatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const file = files[i];
      const content = await parseFile(file);
      newFiles.push({ name: file.name, content, type: file.name.split(".").pop() || "txt" });
    }
    setAttachedFiles((prev) => [...prev, ...newFiles].slice(0, 3));
    e.target.value = "";
  };

  const removeAttachedFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAnalyze = async () => {
    const text = resumeFile?.content || resumeText;
    if (!text) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch("/api/resume-ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text, jdText: mode === "jd" ? jdText : undefined, role: mode === "role" ? (customRole || selectedRole) : undefined, mode, userId }),
      });
      setAnalysisResult(await res.json());
      loadHistory(mode === "jd" ? "JD_MATCH" : "ROLE_RATE", setTab1History);
    } finally { setAnalyzing(false); }
  };

  const handleATSScan = async () => {
    const text = atsResumeFile?.content || atsResumeText;
    if (!text) return;
    setAtsScanning(true);
    setAtsResult(null);
    try {
      const res = await fetch("/api/resume-ai/ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text, userId }),
      });
      setAtsResult(await res.json());
      loadHistory("ATS", setTab2History);
    } finally { setAtsScanning(false); }
  };

  const startNewChat = () => {
    setActiveSession(null);
    setChatMessages([]);
    setShowWelcome(true);
    setAttachedFiles([]);
  };

  const loadSession = (session: ChatSession) => {
    setActiveSession(session.id);
    setChatMessages(session.messages.map((m) => ({ role: m.role.toLowerCase() as "user" | "assistant", content: m.content })));
    setShowWelcome(false);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() && attachedFiles.length === 0) return;
    const fileLabel = attachedFiles.length > 0 ? attachedFiles.map(f => `📎 ${f.name}`).join("  ") + "\n\n" : "";
    const displayContent = fileLabel + content;
    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: displayContent }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    setShowWelcome(false);
    const filesToSend = [...attachedFiles];
    setAttachedFiles([]);
    try {
      const combinedFileContent = filesToSend.map(f => `=== ${f.name} ===\n${f.content}`).join("\n\n");
      const combinedFileNames = filesToSend.map(f => f.name).join(", ");
      const res = await fetch("/api/resume-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          sessionId: activeSession,
          userId,
          newSession: !activeSession,
          title: content.slice(0, 40) || combinedFileNames,
          fileContent: filesToSend.length > 0 ? combinedFileContent : undefined,
          fileName: filesToSend.length > 0 ? combinedFileNames : undefined,
        }),
      });
      const data = await res.json();
      setChatMessages([...newMessages, { role: "assistant", content: data.reply }]);
      if (!activeSession) { setActiveSession(data.sessionId); loadSessions(); }
    } finally { setChatLoading(false); }
  };

  const groupSessionsByMonth = () => {
    const groups: Record<string, ChatSession[]> = {};
    for (const s of sessions) {
      const month = new Date(s.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!groups[month]) groups[month] = [];
      groups[month].push(s);
    }
    return groups;
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

        {/* Topbar */}
        <div className="bg-[#C8102E] px-6 py-3 flex items-center justify-between shadow">
          <div className="flex items-center gap-3">
            <img src="/neu-logo.png" alt="NEU" className="h-8 w-auto" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div>
              <p className="text-white font-bold text-sm leading-tight">NUMockBuddy</p>
              <p className="text-red-200 text-xs">Resume AI</p>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-medium">
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Tab Bar */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6">
          <div className="max-w-5xl mx-auto flex">
            {(["jd", "ats", "chat"] as Tab[]).map((t) => {
              const labels = { jd: "JD vs Resume", ats: "ATS Scanner", chat: "Career Assistant" };
              return (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${activeTab === t ? "border-[#C8102E] text-[#C8102E]" : "border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                  {labels[t]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* ===== TAB 1: JD vs Resume ===== */}
          {activeTab === "jd" && (
            <div>
              <div className="flex gap-2 mb-6">
                {(["jd", "role"] as Mode[]).map((m) => (
                  <button key={m} onClick={() => { setMode(m); setAnalysisResult(null); }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${mode === m ? "bg-[#C8102E] text-white border-[#C8102E]" : "bg-white dark:bg-gray-900 text-gray-500 border-gray-300 dark:border-gray-700 hover:border-[#C8102E]"}`}>
                    {m === "jd" ? "I have a JD" : "No JD, pick a role"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Resume */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Your Resume</p>
                  <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all mb-3 ${resumeFile ? "border-green-400 bg-green-50 dark:bg-green-950" : "border-gray-200 dark:border-gray-700 hover:border-[#C8102E] hover:bg-red-50 dark:hover:bg-red-950"}`}>
                    <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleResumeUpload} />
                    {resumeFile ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                          <span className="text-green-600 font-bold text-xs">{resumeFile.name.split(".").pop()?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-700 dark:text-green-300">{resumeFile.name}</p>
                          <p className="text-xs text-green-500">Ready to analyze · click to replace</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-2">
                          <span className="text-xl">📄</span>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Upload PDF or DOCX</p>
                        <p className="text-xs text-gray-400 mt-0.5">or paste below</p>
                      </>
                    )}
                  </label>
                  <textarea value={resumeText} onChange={(e) => { setResumeText(e.target.value); setResumeFile(null); }}
                    placeholder="Or paste resume text here..."
                    className="w-full h-36 text-sm p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#C8102E]/30 placeholder:text-gray-400" />
                </div>

                {/* JD / Role */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                  {mode === "jd" ? (
                    <>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Job Description</p>
                      <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the full job description..."
                        className="w-full h-28 text-sm p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#C8102E]/30 placeholder:text-gray-400 mb-3" />
                      <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name (optional — shows ATS info)"
                        className="w-full text-sm p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C8102E]/30 placeholder:text-gray-400" />
                      {atsInfo && (
                        <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5 flex-shrink-0">ℹ</span>
                          <div>
                            <p className="text-xs font-bold text-[#C8102E] dark:text-gray-300">{company} uses {atsInfo.ats}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">{atsInfo.note}</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Target Role</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {ROLES.map((r) => (
                          <button key={r} onClick={() => setSelectedRole(r)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedRole === r ? "bg-[#C8102E] text-white border-[#C8102E]" : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#C8102E]"}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                      <input value={customRole} onChange={(e) => setCustomRole(e.target.value)} placeholder="Or type a custom role..."
                        className="w-full text-sm p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C8102E]/30 placeholder:text-gray-400" />
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end mb-8">
                <button onClick={handleAnalyze} disabled={analyzing || (!resumeFile && !resumeText)}
                  className="px-8 py-3 bg-[#C8102E] text-white text-sm font-bold rounded-xl disabled:opacity-40 hover:bg-red-700 transition-all shadow-sm hover:shadow-md">
                  {analyzing ? "Analyzing..." : "Analyze Resume →"}
                </button>
              </div>

              {analyzing && (
                <div className="text-center py-16">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-gray-100 border-t-[#C8102E] rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Analyzing your resume like a real ATS...</p>
                  </div>
                </div>
              )}

              {analysisResult && !analyzing && (
                <div className="space-y-4">
                  {/* Hero Score Row */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      <div className="flex flex-col items-center gap-2">
                        <ScoreGauge score={analysisResult.score} label="Match Score" />
                        {analysisResult.atsProbability !== undefined && (
                          <div className="text-center mt-1">
                            <p className="text-xs text-gray-400">ATS Pass Probability</p>
                            <p className="text-xl font-black" style={{ color: analysisResult.atsProbability >= 70 ? "#16a34a" : analysisResult.atsProbability >= 50 ? "#ca8a04" : "#dc2626" }}>
                              {analysisResult.atsProbability}%
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "Resume Length", value: analysisResult.resumeLength || "—", icon: "📏" },
                          { label: "GPA", value: analysisResult.hasGPA ? "Present ✓" : "Missing ✗", icon: "🎓", ok: analysisResult.hasGPA },
                          { label: "GitHub", value: analysisResult.hasGitHub ? "Present ✓" : "Missing ✗", icon: "💻", ok: analysisResult.hasGitHub },
                          { label: "LinkedIn", value: analysisResult.hasLinkedIn ? "Present ✓" : "Missing ✗", icon: "🔗", ok: analysisResult.hasLinkedIn },
                        ].map((item) => (
                          <div key={item.label} className={`p-3 rounded-xl text-center border ${item.ok === false ? "border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950" : item.ok === true ? "border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-950" : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800"}`}>
                            <p className="text-lg mb-1">{item.icon}</p>
                            <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                            <p className={`text-xs font-bold ${item.ok === false ? "text-red-600" : item.ok === true ? "text-green-600" : "text-gray-600 dark:text-gray-300"}`}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex gap-3 flex-wrap">
                        {analysisResult.firstPersonIssues && <IssueBadge level="critical" />}
                        {analysisResult.tenseMixing && <span className="text-xs text-yellow-600 font-medium">⚠ Mixed tenses detected</span>}
                        {analysisResult.impactVsResponsibility && (
                          <span className="text-xs text-gray-500">Impact style: <strong className="text-gray-700 dark:text-gray-300">{analysisResult.impactVsResponsibility}</strong></span>
                        )}
                      </div>
                      <button onClick={() => setActiveTab("chat")}
                        className="text-xs px-4 py-1.5 bg-[#C8102E]/10 text-[#C8102E] rounded-full hover:bg-[#C8102E]/20 font-semibold transition-colors">
                        Fix with Career Assistant →
                      </button>
                    </div>
                  </div>

                  {/* Keywords Card */}
                  {mode === "jd" && (
                    <CategoryCard title="Keyword Match" score={analysisResult.score} icon="🔍">
                      {(analysisResult.requiredKeywords?.length || 0) > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Required</p>
                          <div className="flex flex-wrap gap-1.5">
                            {analysisResult.requiredKeywords?.map((k) => {
                              const matched = analysisResult.matchedKeywords?.includes(k);
                              const semantic = analysisResult.semanticMatches?.includes(k);
                              return (
                                <span key={k} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${matched ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300" : semantic ? "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300" : "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300"}`}>
                                  {matched ? "✓ " : semantic ? "~ " : "✗ "}{k}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {(analysisResult.preferredKeywords?.length || 0) > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Preferred</p>
                          <div className="flex flex-wrap gap-1.5">
                            {analysisResult.preferredKeywords?.map((k) => {
                              const matched = analysisResult.matchedKeywords?.includes(k);
                              return (
                                <span key={k} className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${matched ? "bg-gray-100 text-[#C8102E] border-gray-200" : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400"}`}>
                                  {matched ? "✓ " : ""}{k}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-4 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Exact match</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />Semantic match</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Missing</span>
                      </div>
                    </CategoryCard>
                  )}

                  {mode === "role" && analysisResult.bars && (
                    <CategoryCard title="Role Fit Scores" icon="🎯">
                      <div className="space-y-3">
                        {Object.entries(analysisResult.bars).map(([k, v]) => {
                          const color = v >= 75 ? "#16a34a" : v >= 50 ? "#ca8a04" : "#dc2626";
                          const { grade } = getLetterGrade(v);
                          return (
                            <div key={k}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color, background: `${color}20` }}>{grade}</span>
                                  <span className="text-sm font-bold" style={{ color }}>{v}</span>
                                </div>
                              </div>
                              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${v}%`, background: color }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CategoryCard>
                  )}

                  {/* Role Fit */}
                  {mode === "jd" && (analysisResult.seniorityMatch || analysisResult.domainMatch) && (
                    <CategoryCard title="Role Fit Analysis" icon="🎯">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { label: "Seniority", value: analysisResult.seniorityMatch, note: analysisResult.seniorityNote },
                          { label: "Domain", value: analysisResult.domainMatch, note: analysisResult.domainNote },
                          { label: "Experience Years", value: analysisResult.experienceYearsMatch ? "strong" : "weak", note: analysisResult.experienceNote },
                          { label: "Leadership", value: analysisResult.leadershipSignals, note: undefined },
                        ].filter(i => i.value).map((item) => (
                          <div key={item.label} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{item.label}</p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.value === "strong" || item.value === "moderate" ? "bg-green-100 text-green-700" : item.value === "partial" || item.value === "weak" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                                {item.value}
                              </span>
                            </div>
                            {item.note && <p className="text-xs text-gray-400 leading-relaxed">{item.note}</p>}
                          </div>
                        ))}
                      </div>
                    </CategoryCard>
                  )}

                  {/* Bullet Quality */}
                  <CategoryCard title="Bullet & Writing Quality" icon="✍️">
                    <div className="space-y-4">
                      {(analysisResult.weakVerbs?.length || 0) > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <IssueBadge level="improve" />
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Weak Verbs — swap these out</p>
                          </div>
                          <div className="space-y-2">
                            {analysisResult.weakVerbs?.slice(0, 5).map((v) => <WeakVerbCard key={v} verb={v} />)}
                          </div>
                        </div>
                      )}
                      {(analysisResult.missingMetrics?.length || 0) > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <IssueBadge level="improve" />
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Bullets missing numbers</p>
                          </div>
                          <div className="space-y-2">
                            {analysisResult.missingMetrics?.slice(0, 3).map((b, i) => (
                              <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 line-clamp-2">"{b}"</p>
                                <p className="text-xs text-[#C8102E] mt-1 font-medium">→ Add scale, %, users, or time saved</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {(analysisResult.formattingIssues?.length || 0) > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <IssueBadge level="nice" />
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Formatting notes</p>
                          </div>
                          <ul className="space-y-1">
                            {analysisResult.formattingIssues?.map((f, i) => (
                              <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5"><span className="text-gray-300 mt-0.5">·</span>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CategoryCard>

                  {/* Strongest Bullets */}
                  {(analysisResult.strongestBullets?.length || 0) > 0 && (
                    <CategoryCard title="Your Strongest Bullets" icon="⭐">
                      <div className="space-y-3">
                        {analysisResult.strongestBullets?.map((b, i) => (
                          <div key={i} className="p-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{b}</p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 font-medium">✓ Strong action verb + measurable result</p>
                          </div>
                        ))}
                      </div>
                    </CategoryCard>
                  )}

                  {/* Improvements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(analysisResult.topImprovements?.length || 0) > 0 && (
                      <CategoryCard title="Top Things to Add" icon="🎯">
                        <div className="space-y-2">
                          {analysisResult.topImprovements?.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                              <span className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-[#C8102E] dark:text-gray-300 flex-shrink-0 mt-0.5">{i + 1}</span>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{s}</p>
                            </div>
                          ))}
                        </div>
                      </CategoryCard>
                    )}
                    {(analysisResult.suggestions?.length || 0) > 0 && (
                      <CategoryCard title="Rewrite Suggestions" icon="✏️">
                        <div className="space-y-2">
                          {analysisResult.suggestions?.map((s, i) => (
                            <div key={i} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-2 border-[#C8102E]">
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{s}</p>
                            </div>
                          ))}
                        </div>
                      </CategoryCard>
                    )}
                  </div>

                  <ScanTimeline scans={tab1History} />
                </div>
              )}
            </div>
          )}

          {/* ===== TAB 2: ATS Scanner ===== */}
          {activeTab === "ats" && (
            <div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm mb-5">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Your Resume</p>
                <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all mb-3 ${atsResumeFile ? "border-green-400 bg-green-50 dark:bg-green-950" : "border-gray-200 dark:border-gray-700 hover:border-[#C8102E] hover:bg-red-50 dark:hover:bg-red-950"}`}>
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleAtsResumeUpload} />
                  {atsResumeFile ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                        <span className="text-green-600 font-bold text-xs">{atsResumeFile.name.split(".").pop()?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300">{atsResumeFile.name}</p>
                        <p className="text-xs text-green-500">Ready to scan · click to replace</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-2">
                        <span className="text-xl">📄</span>
                      </div>
                      <p className="text-sm font-medium text-gray-500">Upload PDF or DOCX</p>
                      <p className="text-xs text-gray-400 mt-0.5">or paste below</p>
                    </>
                  )}
                </label>
                <textarea value={atsResumeText} onChange={(e) => { setAtsResumeText(e.target.value); setAtsResumeFile(null); }}
                  placeholder="Or paste resume text here..."
                  className="w-full h-32 text-sm p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#C8102E]/30 placeholder:text-gray-400" />
              </div>

              <div className="flex justify-end mb-6">
                <button onClick={handleATSScan} disabled={atsScanning || (!atsResumeFile && !atsResumeText)}
                  className="px-8 py-3 bg-[#C8102E] text-white text-sm font-bold rounded-xl disabled:opacity-40 hover:bg-red-700 transition-all shadow-sm hover:shadow-md">
                  {atsScanning ? "Scanning..." : "Scan Resume →"}
                </button>
              </div>

              {atsScanning && (
                <div className="text-center py-16">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-gray-100 border-t-[#C8102E] rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Running through Taleo, Workday, Greenhouse parsers...</p>
                  </div>
                </div>
              )}

              {atsResult && !atsScanning && (
                <div className="space-y-4">
                  {/* Hero */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      <div className="flex flex-col items-center gap-1">
                        <ScoreGauge score={atsResult.overallScore} label={atsResult.verdict} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-3">ATS System Breakdown</p>
                        <div className="grid grid-cols-3 gap-3">
                          {Object.entries(atsResult.atsSystems || {}).map(([sys, status]) => (
                            <div key={sys} className={`p-3 rounded-xl border text-center ${status === "pass" ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : status === "warn" ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800" : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"}`}>
                              <p className="text-xs font-bold text-gray-500 uppercase mb-1">{sys}</p>
                              <span className={`text-xs font-black ${status === "pass" ? "text-green-700 dark:text-green-300" : status === "warn" ? "text-yellow-700 dark:text-yellow-300" : "text-red-700 dark:text-red-300"}`}>
                                {status === "pass" ? "✓ Pass" : status === "warn" ? "⚠ Warn" : "✗ Fail"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => setActiveTab("chat")}
                          className="mt-4 text-xs px-4 py-1.5 bg-[#C8102E]/10 text-[#C8102E] rounded-full hover:bg-[#C8102E]/20 font-semibold transition-colors">
                          Fix with Career Assistant →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contact + Sections */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {atsResult.contactFields && (
                      <CategoryCard title="Contact Info Detected" icon="📋">
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(atsResult.contactFields).map(([field, found]) => (
                            <div key={field} className={`flex items-center gap-2 p-2 rounded-lg ${found ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
                              <span className={`text-sm ${found ? "text-green-500" : "text-red-400"}`}>{found ? "✓" : "✗"}</span>
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">{field}</span>
                            </div>
                          ))}
                        </div>
                      </CategoryCard>
                    )}
                    {(atsResult.detectedSections?.length || 0) > 0 && (
                      <CategoryCard title="Sections" icon="📑">
                        <div className="flex flex-wrap gap-1.5">
                          {atsResult.detectedSections?.map((s) => (
                            <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">✓ {s}</span>
                          ))}
                          {atsResult.missingSections?.map((s) => (
                            <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">✗ {s}</span>
                          ))}
                        </div>
                      </CategoryCard>
                    )}
                  </div>

                  {/* 12 checks */}
                  <CategoryCard title="Detailed Parse Checks" icon="🔬">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {atsResult.checks.map((c) => {
                        const icons = { pass: "✓", warn: "⚠", fail: "✗" };
                        const colors = { pass: "text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800", warn: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800", fail: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800" };
                        return (
                          <div key={c.name} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border ${colors[c.status]}`}>{icons[c.status]}</span>
                            <div>
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{c.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{c.note}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CategoryCard>

                  {/* Severity Issues */}
                  {(atsResult.severityIssues?.length || 0) > 0 && (
                    <CategoryCard title="Issues by Priority" icon="🚨">
                      <div className="space-y-2">
                        {atsResult.severityIssues?.map((issue, i) => (
                          <div key={i} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-2 mb-1">
                              <IssueBadge level={issue.severity === "high" ? "critical" : issue.severity === "medium" ? "improve" : "nice"} />
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{issue.issue}</p>
                            </div>
                            <p className="text-xs text-gray-400 pl-1">Fix: {issue.fix}</p>
                          </div>
                        ))}
                      </div>
                    </CategoryCard>
                  )}

                  {/* Before/After */}
                  {(atsResult.isMultiColumn || atsResult.parseSimulation) && (
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                      <div className="flex">
                        <button onClick={() => setShowAtsGood(false)}
                          className={`flex-1 py-3 text-sm font-bold transition-all ${!showAtsGood ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-b-2 border-red-400" : "bg-white dark:bg-gray-900 text-gray-400 hover:bg-gray-50"}`}>
                          ✗ How ATS reads it
                        </button>
                        <button onClick={() => setShowAtsGood(true)}
                          className={`flex-1 py-3 text-sm font-bold transition-all ${showAtsGood ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-b-2 border-green-400" : "bg-white dark:bg-gray-900 text-gray-400 hover:bg-gray-50"}`}>
                          ✓ How it should look
                        </button>
                      </div>
                      <div className={`p-5 font-mono text-xs leading-loose min-h-32 ${showAtsGood ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
                        <pre className={showAtsGood ? "text-green-700 dark:text-green-300" : "text-red-600 dark:text-red-400"}>
                          {showAtsGood ? (atsResult.parseSimulation?.clean || "Clean format — ATS reads this correctly.") : (atsResult.parseSimulation?.garbled || "Multi-column detected — content may be scrambled.")}
                        </pre>
                      </div>
                    </div>
                  )}

                  <ScanTimeline scans={tab2History} />
                </div>
              )}
            </div>
          )}

          {/* ===== TAB 3: Career Assistant ===== */}
          {activeTab === "chat" && (
            <div className="flex rounded-2xl overflow-hidden shadow-xl border border-gray-800"
              style={{ height: "calc(100vh - 220px)", background: "transparent" }}>

              {/* Sidebar */}
              <div className="w-56 flex-shrink-0 flex flex-col"
                style={{ background: "linear-gradient(180deg, #1a0a0a 0%, #0f0f0f 100%)", borderRight: "1px solid #2a1a1a" }}>
                <div className="p-4" style={{ borderBottom: "1px solid #2a1a1a" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <div className="w-2 h-2 bg-green-400 rounded-full absolute inset-0 animate-ping opacity-60" />
                    </div>
                    <span className="text-xs text-gray-400 font-mono">assistant online</span>
                  </div>
                  <button onClick={startNewChat}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #C8102E, #9b0c23)" }}>
                    + New Chat
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {Object.entries(groupSessionsByMonth()).map(([month, sess]) => (
                    <div key={month}>
                      <p className="text-xs px-2 py-2 font-bold uppercase tracking-widest" style={{ color: "#C8102E" }}>{month}</p>
                      {sess.map((s) => (
                        <button key={s.id} onClick={() => loadSession(s)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs transition-all group"
                          style={{ background: activeSession === s.id ? "rgba(200,16,46,0.15)" : "transparent", borderLeft: activeSession === s.id ? "2px solid #C8102E" : "2px solid transparent" }}>
                          <p className={`truncate font-medium ${activeSession === s.id ? "text-red-400" : "text-gray-400 group-hover:text-gray-200"}`}>
                            {s.title || "Untitled chat"}
                          </p>
                          {s.messages?.[1] && (
                            <p className="text-xs text-gray-600 truncate mt-0.5 group-hover:text-gray-500">
                              {s.messages[1].content.slice(0, 35)}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col min-w-0" style={{ background: "#0d0d0d" }}>
                {/* Header */}
                <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid #1f1f1f" }}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm"
                      style={{ background: "linear-gradient(135deg, #C8102E, #9b0c23)" }}>M</div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0d0d0d]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">MockMate Career Assistant</p>
                    <p className="text-xs text-gray-500 font-mono">NEU · career intelligence</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {showWelcome ? (
                    <div className="flex flex-col items-center justify-center h-full gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white text-2xl mx-auto mb-4"
                          style={{ background: "linear-gradient(135deg, #C8102E, #9b0c23)" }}>M</div>
                        <p className="text-white font-bold text-lg">MockMate Career Assistant</p>
                        <p className="text-gray-500 text-sm mt-1">Upload your resume and ask me anything</p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-center max-w-lg">
                        {QUICK_CHIPS.map((chip) => (
                          <button key={chip.label} onClick={() => sendMessage(chip.prompt)}
                            className="px-4 py-2 rounded-full text-xs font-semibold text-gray-300 hover:text-white transition-all border border-gray-700 hover:border-red-600"
                            style={{ background: "rgba(255,255,255,0.03)" }}>
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                          {m.role === "assistant" && (
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs mr-2 flex-shrink-0 mt-1"
                              style={{ background: "linear-gradient(135deg, #C8102E, #9b0c23)" }}>M</div>
                          )}
                          <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user"
                            ? "text-white rounded-br-sm"
                            : "text-gray-200 rounded-bl-sm border"}`}
                            style={m.role === "user"
                              ? { background: "linear-gradient(135deg, #C8102E, #9b0c23)" }
                              : { background: "#161616", borderColor: "#2a2a2a", borderLeft: "2px solid #C8102E" }}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start items-center gap-3">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                            style={{ background: "linear-gradient(135deg, #C8102E, #9b0c23)" }}>M</div>
                          <div className="px-4 py-3 rounded-2xl rounded-bl-sm border text-xs text-gray-500 italic animate-pulse"
                            style={{ background: "#161616", borderColor: "#2a2a2a" }}>
                            MockMate is thinking...
                          </div>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </>
                  )}
                </div>

                {/* File tray */}
                {attachedFiles.length > 0 && (
                  <div className="px-4 pb-2 flex gap-2 flex-wrap" style={{ borderTop: "1px solid #1f1f1f", paddingTop: "8px" }}>
                    {attachedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs"
                        style={{ background: "#1a1a1a", borderColor: "#333" }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-800">
                          <FileIcon name={f.name} />
                        </div>
                        <span className="text-gray-300 max-w-24 truncate font-medium">{f.name}</span>
                        <button onClick={() => removeAttachedFile(i)} className="text-gray-600 hover:text-red-400 transition-colors font-bold ml-1">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-4" style={{ borderTop: "1px solid #1f1f1f" }}>
                  <div className="flex gap-2 items-end rounded-2xl border px-3 py-2"
                    style={{ background: "#161616", borderColor: "#2a2a2a" }}>
                    <input type="file" ref={chatFileRef} className="hidden" accept=".pdf,.docx,.txt" multiple onChange={handleChatFileUpload} />
                    <button onClick={() => chatFileRef.current?.click()}
                      className="p-2 rounded-xl transition-all hover:bg-red-900/30 flex-shrink-0"
                      title="Attach files (up to 3)">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={attachedFiles.length > 0 ? "#C8102E" : "#555"} strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                    </button>
                    <textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(chatInput); } }}
                      placeholder="Ask anything, or attach your resume first..."
                      rows={2}
                      className="flex-1 bg-transparent text-sm text-gray-200 placeholder:text-gray-600 resize-none focus:outline-none" />
                    <button onClick={() => sendMessage(chatInput)} disabled={chatLoading || (!chatInput.trim() && attachedFiles.length === 0)}
                      className="p-2.5 rounded-xl disabled:opacity-30 transition-all hover:opacity-80 flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #C8102E, #9b0c23)" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-center text-xs text-gray-700 mt-2 font-mono">attach up to 3 files · enter to send · shift+enter for newline</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
