'use client'

import { useState } from 'react'
import Link from 'next/link'

type Program = 'MSCS' | 'MSIS' | 'MSECE' | 'MBAI' | 'Other'

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nuid: '',
    fullName: '',
    email: '',
    program: '' as Program | '',
    gradYear: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  const validateStep1 = () => {
    if (!/^\d{9}$/.test(form.nuid)) return 'NUID must be exactly 9 digits.'
    if (!form.fullName.trim()) return 'Please enter your full name.'
    if (!form.email.endsWith('@northeastern.edu') && !form.email.endsWith('@husky.neu.edu'))
      return 'Please use your Northeastern email (@northeastern.edu or @husky.neu.edu).'
    return ''
  }

  const validateStep2 = () => {
    if (!form.program) return 'Please select your program.'
    if (!form.gradYear) return 'Please select your graduation year.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return ''
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setError(err); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Signup failed. Please try again.')
      } else {
        window.location.href = '/'
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const programs: Program[] = ['MSCS', 'MSIS', 'MSECE', 'MBAI', 'Other']
  const years = ['2025', '2026', '2027', '2028', '2029']

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-photo" />
        <div className="auth-left-overlay" />
        <div className="auth-left-inner">
          <div className="auth-brand">
            <div className="auth-logo-mark">N</div>
            <span className="auth-brand-name">NUMockBuddy</span>
          </div>
          <div className="auth-left-content">
            <h1 className="auth-headline">
              Join 2,400+<br />
              <em>Huskies.</em>
            </h1>
            <p className="auth-subtext">
              Create your free account with your NUID and start preparing for your next co-op or internship today.
            </p>

            <div className="auth-steps-preview">
              <div className={`auth-step-item ${step >= 1 ? 'active' : ''}`}>
                <div className="auth-step-dot">1</div>
                <div>
                  <div className="auth-step-title">Your Identity</div>
                  <div className="auth-step-desc">NUID & contact info</div>
                </div>
              </div>
              <div className="auth-step-line" />
              <div className={`auth-step-item ${step >= 2 ? 'active' : ''}`}>
                <div className="auth-step-dot">2</div>
                <div>
                  <div className="auth-step-title">Your Profile</div>
                  <div className="auth-step-desc">Program & password</div>
                </div>
              </div>
            </div>
          </div>
          <div className="auth-left-bg-circle" />
          <div className="auth-left-bg-circle2" />
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <div className="auth-step-badge">Step {step} of 2</div>
            <h2 className="auth-form-title">
              {step === 1 ? 'Create your account' : 'Almost there!'}
            </h2>
            <p className="auth-form-subtitle">
              {step === 1
                ? 'Enter your Northeastern student credentials'
                : 'Tell us about your program'}
            </p>
          </div>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext() } : handleSubmit} className="auth-form">

            {step === 1 && (
              <>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="nuid">
                    NUID
                    <span className="auth-label-hint">9-digit student ID</span>
                  </label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="16" rx="2"/>
                        <circle cx="9" cy="10" r="2"/>
                        <path d="M15 8h2M15 12h2M7 16h10"/>
                      </svg>
                    </span>
                    <input
                      id="nuid"
                      type="text"
                      inputMode="numeric"
                      maxLength={9}
                      placeholder="000000000"
                      value={form.nuid}
                      onChange={e => update('nuid', e.target.value.replace(/\D/g, ''))}
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="fullName">Full Name</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Jane Husky"
                      value={form.fullName}
                      onChange={e => update('fullName', e.target.value)}
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="email">
                    Northeastern Email
                  </label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </span>
                    <input
                      id="email"
                      type="email"
                      placeholder="j.husky@northeastern.edu"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      className="auth-input"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="auth-field">
                  <label className="auth-label">Program</label>
                  <div className="auth-program-grid">
                    {programs.map(p => (
                      <button
                        key={p}
                        type="button"
                        className={`auth-program-btn ${form.program === p ? 'selected' : ''}`}
                        onClick={() => update('program', p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="gradYear">Expected Graduation Year</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </span>
                    <select
                      id="gradYear"
                      value={form.gradYear}
                      onChange={e => update('gradYear', e.target.value)}
                      className="auth-input auth-select"
                    >
                      <option value="">Select year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="password">
                    Password
                    <span className="auth-label-hint">Min. 8 characters</span>
                  </label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={e => update('confirmPassword', e.target.value)}
                      className="auth-input"
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="auth-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <div className="auth-btn-row">
              {step === 2 && (
                <button type="button" className="auth-btn-back" onClick={() => { setStep(1); setError('') }}>
                  ← Back
                </button>
              )}
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <span className="auth-btn-loading">
                    <span className="auth-spinner" />
                    Creating account…
                  </span>
                ) : step === 1 ? 'Continue →' : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <a href="/login" className="auth-switch-link">Sign in</a>
          </p>

          <div className="auth-footer-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            For Northeastern University students only
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          font-family: var(--font-body);
        }

        /* LEFT PANEL */
        .auth-left {
          width: 44%;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: stretch;
        }
        .auth-left-photo {
          position: absolute;
          inset: 0;
          background: url('/husky_park.png') center center / cover no-repeat;
          z-index: 0;
        }
        .auth-left-overlay {
          position: absolute;
          inset: 0;
          background: rgba(200, 16, 46, 0.82);
          z-index: 1;
          transition: opacity 0.5s ease;
        }
        .auth-left:hover .auth-left-overlay {
          opacity: 0;
        }
        .auth-left:hover .auth-headline,
        .auth-left:hover .auth-brand-name,
        .auth-left:hover .auth-step-title,
        .auth-left:hover .auth-subtext,
        .auth-left:hover .auth-step-desc {
          color: #000;
          transition: color 0.5s ease;
        }
        .auth-left:hover .auth-logo-mark {
          background: #000;
          color: #fff;
          transition: all 0.5s ease;
        }
        .auth-left:hover .auth-step-dot {
          background: #000;
          color: #fff;
          transition: all 0.5s ease;
        }
        .auth-left-inner {
          position: relative;
          z-index: 3;
          padding: 48px 52px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 100%;
        }
        .auth-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .auth-logo-mark {
          width: 40px;
          height: 40px;
          background: white;
          color: var(--color-red);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          line-height: 1;
        }
        .auth-brand-name {
          color: white;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.3px;
          transition: color 0.5s ease;
        }
        .auth-left-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 0;
        }
        .auth-headline {
          font-family: var(--font-display);
          font-size: clamp(36px, 3.5vw, 52px);
          color: white;
          line-height: 1.1;
          margin-bottom: 20px;
          letter-spacing: -0.5px;
          transition: color 0.5s ease;
        }
        .auth-headline em { font-style: italic; opacity: 0.85; }
        .auth-subtext {
          color: rgba(255,255,255,0.75);
          font-size: 15px;
          line-height: 1.7;
          max-width: 340px;
          margin-bottom: 48px;
          transition: color 0.5s ease;
        }
        .auth-steps-preview {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .auth-step-item {
          display: flex;
          align-items: center;
          gap: 14px;
          opacity: 0.45;
          transition: opacity 0.3s;
        }
        .auth-step-item.active { opacity: 1; }
        .auth-step-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .auth-step-item.active .auth-step-dot {
          background: white;
          color: var(--color-red);
        }
        .auth-step-title {
          color: white;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.5s ease;
        }
        .auth-step-desc {
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          transition: color 0.5s ease;
        }
        .auth-step-line {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.2);
          margin-left: 15px;
        }
        .auth-left-bg-circle {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          bottom: -180px;
          right: -140px;
          z-index: 2;
        }
        .auth-left-bg-circle2 {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          top: -80px;
          right: 40px;
          z-index: 2;
        }

        /* RIGHT PANEL */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          padding: 48px 32px;
        }
        .auth-form-wrapper {
          width: 100%;
          max-width: 420px;
        }
        .auth-form-header { margin-bottom: 32px; }
        .auth-step-badge {
          display: inline-block;
          background: var(--color-red-muted);
          color: var(--color-red);
          border: 1px solid var(--color-red-border);
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .auth-form-title {
          font-family: var(--font-display);
          font-size: 32px;
          color: var(--color-black);
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .auth-form-subtitle {
          color: var(--color-gray-400);
          font-size: 15px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 24px;
        }
        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .auth-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-black);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .auth-label-hint {
          font-weight: 400;
          color: var(--color-gray-400);
          font-size: 12px;
        }
        .auth-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .auth-input-icon {
          position: absolute;
          left: 14px;
          color: var(--color-gray-400);
          display: flex;
          align-items: center;
          pointer-events: none;
        }
        .auth-input {
          width: 100%;
          padding: 13px 16px 13px 44px;
          border: 1.5px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--color-black);
          background: var(--color-gray-100);
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          outline: none;
          appearance: none;
        }
        .auth-input::placeholder { color: var(--color-gray-400); }
        .auth-input:focus {
          border-color: var(--color-red);
          background: #fff;
          box-shadow: 0 0 0 3px var(--color-red-muted);
        }
        .auth-select { cursor: pointer; }
        .auth-program-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .auth-program-btn {
          padding: 8px 18px;
          border: 1.5px solid var(--color-gray-200);
          border-radius: var(--radius-full);
          background: var(--color-gray-100);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: var(--color-gray-600);
          cursor: pointer;
          transition: all 0.2s;
        }
        .auth-program-btn:hover {
          border-color: var(--color-red-border);
          color: var(--color-red);
          background: var(--color-red-muted);
        }
        .auth-program-btn.selected {
          border-color: var(--color-red);
          background: var(--color-red);
          color: white;
        }
        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-red-muted);
          border: 1px solid var(--color-red-border);
          color: var(--color-red);
          font-size: 13px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
        }
        .auth-btn-row {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }
        .auth-btn-back {
          padding: 14px 20px;
          background: var(--color-gray-100);
          color: var(--color-gray-600);
          border: 1.5px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .auth-btn-back:hover {
          border-color: var(--color-gray-400);
          color: var(--color-black);
        }
        .auth-btn {
          flex: 1;
          padding: 14px;
          background: var(--color-red);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          box-shadow: var(--shadow-red);
        }
        .auth-btn:hover:not(:disabled) {
          background: var(--color-red-dark);
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(200,16,46,0.35);
        }
        .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .auth-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-switch {
          text-align: center;
          font-size: 14px;
          color: var(--color-gray-400);
          margin-bottom: 24px;
        }
        .auth-switch-link {
          color: var(--color-red);
          font-weight: 600;
          text-decoration: none;
        }
        .auth-switch-link:hover { text-decoration: underline; }
        .auth-footer-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-gray-400);
          border-top: 1px solid var(--color-gray-200);
          padding-top: 20px;
        }
        @media (max-width: 768px) {
          .auth-page { flex-direction: column; }
          .auth-left { width: 100%; min-height: 260px; }
          .auth-left-inner { padding: 32px 24px; }
          .auth-left-content { padding: 20px 0; }
          .auth-right { padding: 40px 24px; }
        }
      `}</style>
    </div>
  )
}