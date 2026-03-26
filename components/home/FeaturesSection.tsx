'use client'
 
const FEATURES = [
  {
    tag: 'AI-Powered',
    title: 'Real Company Patterns',
    desc: 'Questions generated from actual interview formats at Google, Amazon, Meta, Fidelity and more, tailored to your role and program.',
    highlight: 'Technical · Behavioral · System Design · HR',
    image: '/compony.jpg',
    imageAlt: 'Company interview patterns',
  },
  {
    tag: 'Multi-Format',
    title: 'Text & Video Mode',
    desc: 'Web Speech API transcribes filler words in real time, and Claude Vision analyzes your expression from periodic snapshots.',
    highlight: 'Monaco IDE included for technical rounds',
    image: '/video-mode.jpg',
    imageAlt: 'Video interview mode',
  },
  {
    tag: 'Community',
    title: 'Peer Volunteer Network',
    desc: "Connect with NU students who've completed co-ops at your target company. Book sessions, get referral advice.",
    highlight: 'Google Meet integration for screen sharing',
    image: '/co-op1.png',
    imageAlt: 'Peer volunteer network',
  },
  {
    tag: 'Progress Tracking',
    title: 'Performance Dashboard',
    desc: 'Track your avg score, identify weak skill areas over time, and get a daily practice question seeded from what you need most.',
    highlight: 'Session history · Skill trends · Daily card',
    image: '/tracker.png',
    imageAlt: 'Performance dashboard',
  },
  {
    tag: 'Resume AI',
    title: 'Resume Analyzer',
    desc: 'Upload your resume and get instant ATS score, keyword gap analysis, and tailored suggestions to match your target job description.',
    highlight: 'ATS score · JD match · Keyword suggestions',
    image: '/resume.jpg',
    imageAlt: 'Resume analyzer',
  },
]
 
const ICONS = [
  <svg key="ai" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z"/></svg>,
  <svg key="video" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="15" height="10" rx="2"/><path d="M17 9l5-2v10l-5-2"/></svg>,
  <svg key="users" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  <svg key="chart" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-3 3"/></svg>,
  <svg key="resume" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
]
 
export default function FeaturesSection() {
  return (
    <section style={{ padding: '100px 24px', background: '#fff' }}>
      <style>{`
        @media (max-width: 1024px) { .features-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px)  { .features-grid { grid-template-columns: 1fr !important; padding: 60px 16px !important; } }
        @media (max-width: 768px)  { .features-section { padding: 60px 16px !important; } }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
 
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <span style={{
            display: 'inline-block',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-red)',
            marginBottom: 14,
          }}>
            Everything you need
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 3.5vw, 48px)',
            fontWeight: 400,
            color: 'var(--color-black)',
            lineHeight: 1.1,
            letterSpacing: '-0.8px',
            marginBottom: 16,
          }}>
            Practice <span style={{ color: 'var(--color-red)', fontStyle: 'italic' }}>smarter,</span> not just harder.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--color-gray-400)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Every tool you need, built for Northeastern students.
          </p>
        </div>
 
        {/* Cards grid */}
        <div className="features-grid" style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: 24,
}}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              style={{
                background: '#fff',
                borderRadius: 20,
                border: '1.5px solid rgba(200,16,46,0.25)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                cursor: 'default',
                boxShadow: '0 4px 24px rgba(200,16,46,0.08)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-6px)'
                el.style.boxShadow = '0 24px 56px rgba(200,16,46,0.16)'
                el.style.border = '1.5px solid rgba(200,16,46,0.5)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 4px 24px rgba(200,16,46,0.08)'
                el.style.border = '1.5px solid rgba(200,16,46,0.25)'
              }}
            >
              {/* Image area */}
              <div style={{
                width: '100%',
                height: 180,
                background: 'linear-gradient(135deg, #FFF0F2 0%, #FFE0E5 100%)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(200,16,46,0.06)', top: -30, right: -30 }} />
                <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: 'rgba(200,16,46,0.08)', bottom: -20, left: 20 }} />
 
                <img
                  src={f.image}
                  alt={f.imageAlt}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
 
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(200,16,46,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-red)', position: 'relative', zIndex: 1,
                  opacity: f.image ? 0 : 1,
                }}>
                  {ICONS[i]}
                </div>
 
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--color-red)' }} />
              </div>
 
              {/* Content */}
              <div style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-red)' }}>
                  {f.tag}
                </div>
 
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 19, color: 'var(--color-black)', lineHeight: 1.25, letterSpacing: '-0.3px' }}>
                  {f.title}
                </h3>
 
                <p style={{ fontSize: 14, color: 'var(--color-gray-500)', lineHeight: 1.7, flex: 1 }}>
                  {f.desc}
                </p>
 
                <div style={{ marginTop: 8, padding: '8px 14px', background: 'rgba(200,16,46,0.05)', borderRadius: 10, fontSize: 12, fontWeight: 500, color: 'rgba(200,16,46,0.8)', borderLeft: '2px solid rgba(200,16,46,0.3)' }}>
                  {f.highlight}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}