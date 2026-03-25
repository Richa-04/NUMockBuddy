"use client";
import React, { useState, useEffect, useRef } from "react";

const RED = "#C8102E";

const BTN = (on: boolean): React.CSSProperties => ({
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  gap: 6, padding: "12px 8px", border: on ? `1.5px solid ${RED}` : "1.5px solid #e8e8e8",
  borderRadius: 12, background: on ? "#fff5f5" : "#fff", cursor: "pointer",
  fontSize: 11, fontWeight: 600, color: on ? RED : "#444",
  transition: "all 150ms", minWidth: 80, minHeight: 80, lineHeight: 1.3, textAlign: "center" as const,
});

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [flags, setFlags] = useState({
    highlightTitles: false, highlightLinks: false, dyslexia: false,
    letterSpacing: false, lineHeight: false, fontBold: false,
    darkContrast: false, lightContrast: false, highContrast: false,
    highSat: false, lowSat: false, mono: false,
    stopAnimations: false, bigCursor: false, readingGuide: false,
  });
  const guideRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const toggle = (key: keyof typeof flags) => setFlags(p => ({ ...p, [key]: !p[key] }));

  const reset = () => {
    setFontSize(100);
    setFlags({ highlightTitles:false, highlightLinks:false, dyslexia:false, letterSpacing:false, lineHeight:false, fontBold:false, darkContrast:false, lightContrast:false, highContrast:false, highSat:false, lowSat:false, mono:false, stopAnimations:false, bigCursor:false, readingGuide:false });
  };

  // Inject/update a single <style> tag — never touch element.style directly
  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement("style");
      el.id = "a11y-styles";
      document.head.appendChild(el);
      styleRef.current = el;
    }
    const css: string[] = [];

    if (fontSize !== 100) css.push(`html { font-size: ${fontSize}% !important; }`);
    if (flags.letterSpacing) css.push("p, span, li, a, button, label, h1,h2,h3,h4 { letter-spacing: 0.1em !important; }");
    if (flags.lineHeight) css.push("p, li, span { line-height: 2 !important; }");
    if (flags.fontBold) css.push("p, span, li, a { font-weight: 700 !important; }");
    if (flags.dyslexia) css.push("body, body * { font-family: Arial, Helvetica, sans-serif !important; }");
    if (flags.highlightTitles) css.push("h1,h2,h3,h4,h5,h6 { outline: 2px solid #C8102E !important; outline-offset: 2px; }");
    if (flags.highlightLinks) css.push("a { outline: 2px solid #0ea5e9 !important; background: #e0f2fe !important; }");
    if (flags.stopAnimations) css.push("*, *::before, *::after { animation: none !important; transition: none !important; }");
    if (flags.bigCursor) css.push("* { cursor: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><circle cx='6' cy='6' r='6' fill='black'/></svg>\") 6 6, auto !important; }");

    // Color filters applied only to main content, not the widget itself
    const filters: string[] = [];
    if (flags.darkContrast) filters.push("brightness(0.75) contrast(1.4)");
    if (flags.lightContrast) filters.push("brightness(1.25) contrast(0.85)");
    if (flags.highContrast) filters.push("contrast(1.8)");
    if (flags.highSat) filters.push("saturate(2)");
    if (flags.lowSat) filters.push("saturate(0.4)");
    if (flags.mono) filters.push("grayscale(1)");
    if (filters.length) css.push(`main, nav, footer { filter: ${filters.join(" ")} !important; }`);

    styleRef.current.textContent = css.join("\n");
  }, [fontSize, flags]);

  // Cleanup on unmount
  useEffect(() => () => { styleRef.current?.remove(); }, []);

  // Reading guide
  useEffect(() => {
    const guide = guideRef.current;
    if (!guide) return;
    guide.style.display = flags.readingGuide ? "block" : "none";
    if (!flags.readingGuide) return;
    const move = (e: MouseEvent) => { guide.style.top = (e.clientY - 20) + "px"; };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [flags.readingGuide]);

  return (
    <>
      <div ref={guideRef} style={{ display:"none", position:"fixed", left:0, right:0, height:40, background:"rgba(200,16,46,0.1)", borderTop:`2px solid ${RED}`, borderBottom:`2px solid ${RED}`, pointerEvents:"none", zIndex:99999 }} />

      <button onClick={() => setOpen(p => !p)} aria-label="Accessibility Menu"
        style={{ position:"fixed", bottom:24, left:24, zIndex:9998, width:48, height:48, borderRadius:"50%", background:"#fff", border:"2px solid #e0e0e0", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.12)", transition:"border-color 150ms" }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = RED}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "#e0e0e0"}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8">
          <circle cx="12" cy="4" r="1.5" fill="#333" stroke="none"/>
          <path d="M12 6v7M9 8.5h6M9.5 21l1.5-5.5M14.5 21l-1.5-5.5"/>
          <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
        </svg>
      </button>

      {open && (
        <div style={{ position:"fixed", bottom:84, left:24, zIndex:9997, width:340, maxHeight:"78vh", background:"#fff", borderRadius:16, boxShadow:"0 8px 40px rgba(0,0,0,0.18)", display:"flex", flexDirection:"column", overflow:"hidden", fontFamily:"system-ui,-apple-system,sans-serif" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div>
              <p style={{ margin:0, fontWeight:700, fontSize:15, color:"#111" }}>Accessibility Menu</p>
              <p style={{ margin:"2px 0 0", fontSize:11, color:"#aaa" }}>NUMockBuddy</p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={reset} style={{ background:"none", border:"1px solid #e0e0e0", borderRadius:8, padding:"5px 10px", fontSize:12, cursor:"pointer", color:"#666", display:"flex", alignItems:"center", gap:4 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>Reset
              </button>
              <button onClick={() => setOpen(false)} style={{ background:"none", border:"1px solid #e0e0e0", borderRadius:8, width:30, height:30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#666" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <div style={{ overflowY:"auto", padding:"16px 20px 20px" }}>
            <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:0.7 }}>Content Adjustments</p>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, background:"#f7f7f8", borderRadius:10, padding:"10px 14px" }}>
              <span style={{ fontSize:12, fontWeight:600, color:"#555", flex:1 }}>Adjust Font Size</span>
              <button onClick={() => setFontSize(p => Math.max(80,p-10))} style={{ width:28,height:28,borderRadius:"50%",border:"1.5px solid #ddd",background:"#fff",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>−</button>
              <span style={{ fontSize:13,fontWeight:700,color:"#111",minWidth:40,textAlign:"center" }}>{fontSize}%</span>
              <button onClick={() => setFontSize(p => Math.min(150,p+10))} style={{ width:28,height:28,borderRadius:"50%",border:"1.5px solid #ddd",background:"#fff",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center" }}>+</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:20 }}>
              {([["highlightTitles","Highlight Titles","T"],["highlightLinks","Highlight Links","🔗"],["dyslexia","Dyslexia Font","A"],["letterSpacing","Letter Spacing","|A|"],["lineHeight","Line Height","≡"],["fontBold","Font Weight","B"]] as [keyof typeof flags, string, string][]).map(([key,label,ico]) => (
                <button key={key} style={BTN(flags[key])} onClick={() => toggle(key)}>
                  <span style={{ fontSize:18, fontWeight:700 }}>{ico}</span>{label}
                </button>
              ))}
            </div>
            <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:0.7 }}>Color Adjustments</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:20 }}>
              {([["darkContrast","Dark Contrast","◑"],["lightContrast","Light Contrast","☀"],["highContrast","High Contrast","◉"],["highSat","High Saturation","🎨"],["lowSat","Low Saturation","◫"],["mono","Monochrome","⬜"]] as [keyof typeof flags, string, string][]).map(([key,label,ico]) => (
                <button key={key} style={BTN(flags[key])} onClick={() => toggle(key)}>
                  <span style={{ fontSize:18 }}>{ico}</span>{label}
                </button>
              ))}
            </div>
            <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"#aaa", textTransform:"uppercase", letterSpacing:0.7 }}>Tools</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {([["readingGuide","Reading Guide","📖"],["stopAnimations","Stop Animations","⏸"],["bigCursor","Big Cursor","🖱"]] as [keyof typeof flags, string, string][]).map(([key,label,ico]) => (
                <button key={key} style={BTN(flags[key])} onClick={() => toggle(key)}>
                  <span style={{ fontSize:18 }}>{ico}</span>{label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}