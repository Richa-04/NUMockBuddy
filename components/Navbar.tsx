'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const NAV_LINKS = [
  { href: '/practice', label: 'Practice' },
  { href: '/volunteers', label: 'Volunteers' },
  { href: '/resume', label: 'Resume' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/help', label: 'Help' },
  { href: '/feedback', label: 'Feedback' },
]

interface UserInfo {
  fullName: string
  nuid: string
}

export default function Navbar() {
  const [menuOpen, setMenuOpen]     = useState(false)
  const [user, setUser]             = useState<UserInfo | null>(null)
  const [dropdownOpen, setDropdown] = useState(false)
  const dropdownRef                 = useRef<HTMLDivElement>(null)
  const router                      = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) setUser({ fullName: data.fullName, nuid: data.nuid })
      })
      .catch(() => {})
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setDropdown(false)
    router.push('/')
  }

  const firstName = user?.fullName?.split(' ')[0] ?? ''
  const initial   = firstName[0]?.toUpperCase() ?? ''

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
          {user ? (
            /* ── Profile button + dropdown ── */
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdown(o => !o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px 6px 6px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--color-gray-200)',
                  background: '#fff',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-red)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-gray-200)')}
              >
                {/* Avatar circle */}
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'var(--color-red)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {initial}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-black)' }}>
                  {firstName}
                </span>
                {/* Chevron */}
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ color: 'var(--color-gray-400)', transition: 'transform 0.15s ease', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}
                >
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: 220,
                  background: '#fff',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                  overflow: 'hidden',
                  zIndex: 200,
                }}>
                  {/* User info header */}
                  <div style={{
                    padding: '14px 16px 12px',
                    borderBottom: '1px solid var(--color-gray-200)',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-black)' }}>
                      {user.fullName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 2 }}>
                      NUID: {user.nuid}
                    </div>
                  </div>

                  {/* Dashboard link */}
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '11px 16px',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--color-black)',
                      textDecoration: 'none',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f9f9f9')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    Dashboard
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '11px 16px',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--color-red)',
                      background: 'none',
                      border: 'none',
                      borderTop: '1px solid var(--color-gray-200)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fff5f5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M5.5 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <path d="M10 10.5L13 7.5L10 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 7.5H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
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
              Sign In
            </Link>
          )}

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
          {user && (
            <>
              <div style={{
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--color-gray-400)',
                borderTop: '1px solid var(--color-gray-200)',
                marginTop: 4,
              }}>
                {user.fullName} · {user.nuid}
              </div>
              <button
                onClick={() => { setMenuOpen(false); handleLogout() }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 15,
                  fontWeight: 500,
                  color: 'var(--color-red)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                Log out
              </button>
            </>
          )}
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
