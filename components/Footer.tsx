'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--color-gray-200)',
      padding: '32px 24px',
      background: '#fff',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>

        {/* Left — brand */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-black)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              background: 'var(--color-red)',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              border: 'none',
            }}
          >
            NUMockBuddy
          </button>
          <span style={{ fontWeight: 400, color: 'var(--color-gray-400)' }}>
            · Northeastern University
          </span>
        </p>

        {/* Center — links */}
        <div style={{ display: 'flex', gap: 24 }}>
          {['Practice', 'Volunteers', 'Resume', 'Dashboard', 'Companies'].map(item => (
            <Link key={item} href={`/${item.toLowerCase()}`} style={{
              fontSize: 13,
              color: 'var(--color-gray-400)',
              textDecoration: 'none',
            }}>
              {item}
            </Link>
          ))}
        </div>

        {/* Right — copyright */}
        <p style={{ fontSize: 13, color: 'var(--color-gray-400)', margin: 0 }}>
          © 2026 · Built by NU Seattle students
        </p>

      </div>
    </footer>
  )
}