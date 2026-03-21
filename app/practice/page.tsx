'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

const PROGRAMS = ['Internship / Co-op', 'Full-time']
const COMPANIES = ['General (No specific company)', 'Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Fidelity', 'Salesforce', 'Adobe', 'Other']
const ROLE_TYPES = ['SWE', 'DS', 'TPM', 'Audit']
const INTERVIEW_TYPES = ['Technical', 'Behavioral', 'System Design', 'HR']

export default function PracticePage() {
  const router = useRouter()
  const [selectedProgram, setSelectedProgram] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedInterview, setSelectedInterview] = useState('')

  const completedSteps = [selectedProgram, selectedCompany, selectedRole, selectedInterview].filter(Boolean).length

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      paddingTop: 'var(--space-3xl)',
      paddingBottom: 'var(--space-3xl)',
      paddingLeft: 'var(--space-lg)',
      paddingRight: 'var(--space-lg)',
      background: '#fff',
      minHeight: '100vh',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(var(--color-gray-200) 1px, transparent 1px),
          linear-gradient(90deg, var(--color-gray-200) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        opacity: 0.5,
        pointerEvents: 'none',
      }} />

      {/* Red glow orb */}
      <div style={{
        position: 'absolute',
        top: -120,
        right: '15%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,16,46,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          {/* Progress bar */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-black)' }}>Setup Your Mock Interview</h2>
              <Badge variant="red">Step {completedSteps} of 4</Badge>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4].map(step => (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background: step <= completedSteps ? 'var(--color-red)' : 'var(--color-gray-200)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Program selector */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-black)', marginBottom: 16 }}>Job Type</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PROGRAMS.map(program => (
                <button
                  key={program}
                  onClick={() => setSelectedProgram(program)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: `1.5px solid ${selectedProgram === program ? 'var(--color-red)' : 'var(--color-gray-200)'}`,
                    background: selectedProgram === program ? 'var(--color-red)' : 'transparent',
                    color: selectedProgram === program ? '#fff' : 'var(--color-black)',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {program}
                </button>
              ))}
            </div>
          </div>

          {/* Target company */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-black)', marginBottom: 16 }}>Company</h3>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-gray-200)',
                background: '#fff',
                fontSize: 14,
                color: 'var(--color-black)',
                cursor: 'pointer',
              }}
            >
              <option value="">Select a company</option>
              {COMPANIES.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          {/* Role type grid */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-black)', marginBottom: 16 }}>Role Type</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
              {ROLE_TYPES.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${selectedRole === role ? 'var(--color-red)' : 'var(--color-gray-200)'}`,
                    background: selectedRole === role ? 'var(--color-red)' : 'transparent',
                    color: selectedRole === role ? '#fff' : 'var(--color-black)',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Interview type grid */}
          <div style={{ marginBottom: 48 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-black)', marginBottom: 16 }}>Interview Type</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {INTERVIEW_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedInterview(type)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${selectedInterview === type ? 'var(--color-red)' : 'var(--color-gray-200)'}`,
                    background: selectedInterview === type ? 'var(--color-red)' : 'transparent',
                    color: selectedInterview === type ? '#fff' : 'var(--color-black)',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
            <Button variant="outline" size="lg" href="/">
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={!selectedProgram || !selectedCompany || !selectedRole || !selectedInterview}
              onClick={() => {
                const params = new URLSearchParams({
                  company: selectedCompany,
                  role: selectedRole,
                  interviewType: selectedInterview,
                  jobType: selectedProgram,
                })
                router.push(`/practice/lobby?${params.toString()}`)
              }}
            >
              Start Interview
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}