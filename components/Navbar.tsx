'use client'

import Link from 'next/link'

import { useState } from 'react'

const NAV_LINKS = [
  { href: '/practice', label: 'Practice' },
  { href: '/volunteers', label: 'Volunteers' },
  { href: '/resume', label: 'Resume' },
  { href: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-gray-200)',
    }}>
      <nav style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 var(--space-lg)',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/nuLogo.jpg"
            alt="Northeastern University"
            style={{ height: 36, width: 'auto', objectFit: 'contain' }}
          />
          <div style={{ width: 1, height: 24, background: 'var(--color-gray-200)' }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            fontWeight: 700,
            color: 'var(--color-black)',
            letterSpacing: '-0.4px',
          }}>
            NUMockBuddy
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--color-gray-600)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.color = 'var(--color-red)'
                ;(e.target as HTMLElement).style.background = 'var(--color-red-muted)'
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.color = 'var(--color-gray-600)'
                ;(e.target as HTMLElement).style.background = 'transparent'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href="/login"
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: 14,
              fontWeight: 600,
              background: 'var(--color-red)',
              color: '#fff',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-red)',
              transition: 'all 0.15s ease',
            }}
          >
            Sign in with NUid
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
            }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {menuOpen ? (
                <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              ) : (
                <>
                  <path d="M3 6H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M3 11H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M3 16H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: '#fff',
          borderTop: '1px solid var(--color-gray-200)',
          padding: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }} className="mobile-menu">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--color-gray-600)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}