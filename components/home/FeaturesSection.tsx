'use client'

import Badge from '@/components/ui/Badge'

const FEATURES = [
  { tag: 'AI-Powered', title: 'Real Company Patterns', desc: 'Questions generated from actual interview formats at Google, Amazon, Meta, Fidelity and more — tailored to your role and program.', highlight: 'Technical · Behavioral · System Design · HR', accent: true },
  { tag: 'Multi-Format', title: 'Text & Video Mode', desc: 'Web Speech API transcribes filler words in real time, and Claude Vision analyzes your expression from periodic snapshots.', highlight: 'Monaco IDE included for technical rounds', accent: false },
  { tag: 'Community', title: 'Peer Volunteer Network', desc: "Connect with NU students who've completed co-ops at your target company. Book sessions, get referral advice.", highlight: 'Google Meet integration for screen sharing', accent: false },
  { tag: 'Progress Tracking', title: 'Performance Dashboard', desc: 'Track your avg score, identify weak skill areas over time, and get a daily practice question seeded from what you need most.', highlight: 'Session history · Skill trends · Daily card', accent: false },
]

export default function FeaturesSection() {
  return (
    <section style={{ padding: '96px 24px', background: 'var(--color-gray-100)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 400, color: 'var(--color-black)', lineHeight: 1.1, letterSpacing: '-0.8px', marginBottom: 16 }}>
            Practice <span style={{ color: 'var(--color-red)', fontStyle: 'italic' }}>smarter,</span> not just harder.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--color-gray-400)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Every tool you need, built for Northeastern Seattle students.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: '#fff',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-lg)',
                padding: 40,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                borderTop: f.accent ? '3px solid var(--color-red)' : '1px solid var(--color-gray-200)',
                boxShadow: f.accent ? '0 4px 20px rgba(200,16,46,0.07)' : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = f.accent
                  ? '0 20px 48px rgba(200,16,46,0.15)'
                  : '0 20px 48px rgba(0,0,0,0.10)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = f.accent
                  ? '0 4px 20px rgba(200,16,46,0.07)'
                  : '0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              <div>
                <Badge variant={f.accent ? 'red' : 'default'} style={{ marginBottom: 10 }}>{f.tag}</Badge>
                <h3 style={{ fontWeight: 700, fontSize: 17, color: 'var(--color-black)', marginBottom: 8, lineHeight: 1.3 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-gray-600)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--color-gray-100)', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 500, color: 'var(--color-gray-400)', marginTop: 'auto' }}>
                {f.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}