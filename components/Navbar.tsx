'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const NAV_LINKS = [
  { href: '/practice', label: 'Practice' },
  { href: '/volunteers', label: 'Volunteers' },
  { href: '/resume', label: 'Resume' },
  { href: '/dashboard', label: 'Dashboard' },
]

interface UserInfo {
  fullName: string
  email: string
  program: string
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn && data.user) setUser(data.user)
        else setUser(null)
      })
      .catch(() => setUser(null))
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setDropdownOpen(false)
    window.location.href = '/'
  }

  const firstName = user?.fullName?.split(' ')[0] ?? ''
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : ''

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-gray-200)',
    }}>
      <nav style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 var(--space-lg)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/nuLogo.jpg" alt="Northeastern University" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          <div style={{ width: 1, height: 24, background: 'var(--color-gray-200)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--color-black)', letterSpacing: '-0.4px' }}>
            NUMockBuddy
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 500, color: 'var(--color-gray-600)', textDecoration: 'none', transition: 'all 0.15s ease' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--color-red)'; (e.target as HTMLElement).style.background = 'var(--color-red-muted)' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--color-gray-600)'; (e.target as HTMLElement).style.background = 'transparent' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA / Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              {/* Profile button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 14px 6px 6px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--color-gray-200)',
                  background: '#fff', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-red)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-gray-200)')}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'var(--color-red)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  {initials}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-black)' }}>
                  {firstName}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  width: 260, background: '#fff',
                  borderRadius: 16, border: '1px solid #EBEBEB',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  overflow: 'hidden', zIndex: 200,
                }}>
                  {/* Header */}
                  <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F3F3F3' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'var(--color-red)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 16, fontWeight: 700, flexShrink: 0,
                      }}>
                        {initials}
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>Hi, {firstName}</p>
                        <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{user.email}</p>
                      </div>
                    </div>
                    {user.program && (
                      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, color: 'var(--color-red)', background: 'rgba(200,16,46,0.06)', padding: '3px 10px', borderRadius: 99 }}>
                        {user.program}
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  

                  {/* Sign out */}
                  <div style={{ borderTop: '1px solid #F3F3F3', padding: '8px 0' }}>
                    <button onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 20px', fontSize: 14, color: 'var(--color-red)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FFF1F2')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 600, background: 'var(--color-red)', color: '#fff', textDecoration: 'none', boxShadow: 'var(--shadow-red)' }}>
              Sign in 
            </Link>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} className="mobile-menu-btn" aria-label="Toggle menu">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {menuOpen
                ? <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                : <><path d="M3 6H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M3 11H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M3 16H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid var(--color-gray-200)', padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 4 }} className="mobile-menu">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 15, fontWeight: 500, color: 'var(--color-gray-600)', textDecoration: 'none' }}>
              {link.label}
            </Link>
          ))}
          {user && (
            <button onClick={handleLogout} style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 15, fontWeight: 500, color: 'var(--color-red)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              Sign Out
            </button>
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