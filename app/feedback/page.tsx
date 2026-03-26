"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";

const RED = "#C8102E";

const FEEDBACK_TYPES = [
  { value: "", label: "Select feedback type..." },
  { value: "session", label: "Session Feedback (Rate AI questions & feedback quality)" },
  { value: "platform", label: "Platform Feedback (UI, ease of use, features)" },
  { value: "mentor", label: "Peer Mentor Feedback (Rate a volunteer session)" },
  { value: "bug", label: "Bug Report (Something broke)" },
  { value: "feature", label: "Feature Request (I wish NUMockBuddy had X)" },
];

const TYPE_META: Record<string, { icon: string; color: string; placeholder: string }> = {
  session: { icon: "🎤", color: "#7c3aed", placeholder: "Which company or question set were you practicing? Were the questions realistic? Was the AI feedback specific and actionable? What could be better?" },
  platform: { icon: "💻", color: "#0ea5e9", placeholder: "What did you find confusing or frustrating? What worked well? What features would you like to see added?" },
  mentor: { icon: "🤝", color: "#10b981", placeholder: "Who did you meet with? Was the mentor prepared and helpful? Did they show up on time? Would you recommend them?" },
  bug: { icon: "🐛", color: "#ef4444", placeholder: "What were you doing when the bug occurred? What happened? What did you expect? Which browser and device are you using?" },
  feature: { icon: "✨", color: "#f59e0b", placeholder: "Describe the feature you want. What problem would it solve? How would you use it? The more specific, the better." },
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, fontSize: 32, lineHeight: 1, color: star <= (hovered || value) ? "#f59e0b" : "#e5e7eb", transition: "color 100ms, transform 100ms", transform: star <= (hovered || value) ? "scale(1.15)" : "scale(1)" }}>
          ★
        </button>
      ))}
      {(hovered || value) > 0 && (
        <span style={{ fontSize: 14, color: "#666", marginLeft: 4 }}>{labels[hovered || value]}</span>
      )}
    </div>
  );
}

export default function FeedbackPage() {
  const [type, setType] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [extra, setExtra] = useState<Record<string,string>>({});
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = type ? TYPE_META[type] : null;
  const needsRating = type && type !== "bug" && type !== "feature";
  const canSubmit = type && text.trim().length > 0 && (!needsRating || rating > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, rating: rating || null, text, extra }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f7f8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", textAlign: "center", maxWidth: 460, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>✅</div>
          <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 800, color: "#111" }}>Thanks for your feedback!</h2>
          <p style={{ margin: "0 0 28px", fontSize: 15, color: "#666", lineHeight: 1.6 }}>Your response has been received. The NUMockBuddy team reviews all feedback and uses it to improve the platform.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { setSubmitted(false); setType(""); setRating(0); setText(""); setExtra({}); setScreenshot(null); }}
              style={{ padding: "10px 20px", background: RED, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Submit more feedback
            </button>
            <Link href="/" style={{ padding: "10px 20px", background: "#fff", color: "#444", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Back to NUMockBuddy
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f8", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: `linear-gradient(135deg, ${RED} 0%, #8b0a1e 100%)`, padding: "40px 24px 36px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.75)", fontSize: 13, textDecoration: "none", marginBottom: 18 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to NUMockBuddy
          </Link>
          <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>Share your feedback</h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 15 }}>Help us make NUMockBuddy better for every Northeastern student.</p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px 64px" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>

            {/* Feedback type */}
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f0f0f0" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Feedback type <span style={{ color: RED }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <select value={type} onChange={e => { setType(e.target.value); setRating(0); setText(""); setExtra({}); }}
                  style={{ width: "100%", padding: "12px 40px 12px 14px", fontSize: 14, border: "1.5px solid #e0e0e0", borderRadius: 10, outline: "none", appearance: "none", background: "#fff", color: type ? "#111" : "#999", cursor: "pointer" }}>
                  {FEEDBACK_TYPES.map(t => (
                    <option key={t.value} value={t.value} disabled={t.value === ""}>{t.label}</option>
                  ))}
                </select>
                <svg style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#aaa" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>

            {type && meta && (
              <>
                {/* Type banner */}
                <div style={{ padding: "14px 28px", background: meta.color + "12", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{meta.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: meta.color }}>{FEEDBACK_TYPES.find(t => t.value === type)?.label.split(" — ")[0]}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{FEEDBACK_TYPES.find(t => t.value === type)?.label.split(" — ")[1]}</p>
                  </div>
                </div>

                {/* Session extra fields */}
                {type === "session" && (
                  <div style={{ padding: "20px 28px 0", display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Company / Question set</label>
                      <input value={extra.company || ""} onChange={e => setExtra(p => ({ ...p, company: e.target.value }))}
                        placeholder="e.g. Amazon behavioral"
                        style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1.5px solid #e0e0e0", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
                        onFocus={e => (e.target.style.borderColor = RED)} onBlur={e => (e.target.style.borderColor = "#e0e0e0")} />
                    </div>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Question difficulty</label>
                      <select value={extra.difficulty || ""} onChange={e => setExtra(p => ({ ...p, difficulty: e.target.value }))}
                        style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1.5px solid #e0e0e0", borderRadius: 8, outline: "none", background: "#fff", boxSizing: "border-box" }}>
                        <option value="">Select...</option>
                        <option value="too-easy">Too easy</option>
                        <option value="just-right">Just right</option>
                        <option value="too-hard">Too hard</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Mentor extra field */}
                {type === "mentor" && (
                  <div style={{ padding: "20px 28px 0" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Mentor name</label>
                    <input value={extra.mentor || ""} onChange={e => setExtra(p => ({ ...p, mentor: e.target.value }))}
                      placeholder="Who did you meet with?"
                      style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1.5px solid #e0e0e0", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => (e.target.style.borderColor = RED)} onBlur={e => (e.target.style.borderColor = "#e0e0e0")} />
                  </div>
                )}

                {/* Star rating */}
                {needsRating && (
                  <div style={{ padding: "20px 28px 0" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Overall rating <span style={{ color: RED }}>*</span>
                    </label>
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                )}

                {/* Details textarea */}
                <div style={{ padding: "20px 28px" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Details <span style={{ color: RED }}>*</span>
                  </label>
                  <textarea value={text} onChange={e => setText(e.target.value)}
                    placeholder={meta.placeholder}
                    rows={5}
                    style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1.5px solid #e0e0e0", borderRadius: 10, outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box", fontFamily: "inherit", color: "#222" }}
                    onFocus={e => (e.target.style.borderColor = RED)} onBlur={e => (e.target.style.borderColor = "#e0e0e0")} />
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: text.length < 20 ? "#aaa" : "#10b981" }}>
                    {text.length} characters{text.length > 0 && text.length < 20 ? " — add a bit more detail" : ""}
                  </p>
                </div>

                {/* Screenshot for bugs */}
                {type === "bug" && (
                  <div style={{ padding: "0 28px 24px" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Screenshot <span style={{ color: "#aaa", fontWeight: 400, textTransform: "none" }}>(optional)</span>
                    </label>
                    <div onClick={() => fileRef.current?.click()}
                      style={{ border: "2px dashed #e0e0e0", borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", background: screenshot ? "#f0fdf4" : "#fafafa" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = RED}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = screenshot ? "#bbf7d0" : "#e0e0e0"}>
                      {screenshot ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <span style={{ fontSize: 20 }}>✅</span>
                          <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>{screenshot.name}</span>
                          <button type="button" onClick={e => { e.stopPropagation(); setScreenshot(null); }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }}>×</button>
                        </div>
                      ) : (
                        <div>
                          <p style={{ margin: "0 0 4px", fontSize: 22 }}>📎</p>
                          <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Click to attach a screenshot</p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#bbb" }}>PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) setScreenshot(f); }} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Submit button */}
          {type && (
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 12, alignItems: "center" }}>
              <Link href="/" style={{ fontSize: 14, color: "#888", textDecoration: "none" }}>Cancel</Link>
              <button type="submit" disabled={!canSubmit || submitting}
                style={{ padding: "12px 28px", background: canSubmit ? RED : "#e0e0e0", color: canSubmit ? "#fff" : "#aaa", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: canSubmit ? "pointer" : "default", transition: "all 180ms", display: "flex", alignItems: "center", gap: 8 }}>
                {submitting ? (
                  <>
                    <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Submitting...
                  </>
                ) : "Submit feedback"}
              </button>
            </div>
          )}
        </form>

        {/* Info cards */}
        <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { icon: "🔍", title: "Bug reports", desc: "Reviewed within 24 hours and triaged for fixes" },
            { icon: "🗺️", title: "Feature requests", desc: "Tracked and considered for the product roadmap" },
            { icon: "⭐", title: "Session feedback", desc: "Used to improve AI question and feedback quality" },
            { icon: "🤝", title: "Mentor feedback", desc: "Shared anonymously to help mentors improve" },
          ].map((card, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ margin: "0 0 6px", fontSize: 20 }}>{card.icon}</p>
              <p style={{ margin: "0 0 4px", fontSize: 13.5, fontWeight: 700, color: "#111" }}>{card.title}</p>
              <p style={{ margin: 0, fontSize: 12.5, color: "#888", lineHeight: 1.4 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}