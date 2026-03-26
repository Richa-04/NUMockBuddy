import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const passwordHash = await bcrypt.hash('Demo@123', 10)

  // ── Clear old demo accounts ──────────────────────────────────────────────────

  await prisma.user.deleteMany({
    where: { nuid: { in: ['111111111', '222222222'] } },
  })

  // ── Users ────────────────────────────────────────────────────────────────────

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@northeastern.edu' },
    update: {},
    create: {
      fullName:     'Demo User',
      email:        'demo@northeastern.edu',
      nuid:         '111111111',
      passwordHash,
      program:      'MSCS',
      gradYear:     '2026',
    },
  })

  const testUser = await prisma.user.upsert({
    where: { email: 'test@northeastern.edu' },
    update: {},
    create: {
      fullName:     'Test User',
      email:        'test@northeastern.edu',
      nuid:         '222222222',
      passwordHash,
      program:      'MSIS',
      gradYear:     '2027',
    },
  })

  console.log('✓ Users created:', demoUser.email, testUser.email)

  // ── Clear existing sessions for demo accounts ─────────────────────────────────

  await prisma.practiceSession.deleteMany({
    where: { userId: { in: ['111111111', '222222222'] } },
  })

  // ── Helper ───────────────────────────────────────────────────────────────────

  function verdict(score: number): string {
    if (score >= 9) return 'Strong'
    if (score >= 7) return 'Very Good'
    if (score >= 5) return 'Good'
    if (score >= 3) return 'Needs Work'
    return 'Incomplete'
  }

  // ── Demo User sessions (scores improving: 3 → 9) ────────────────────────────

  const demoSessions = [
    {
      company: 'Google',       role: 'Software Engineer',          interviewType: 'Technical',     jobType: 'Full-time',
      overallScore: 3, answeredCount: 3, skippedCount: 2, totalFillers: 15, totalRepeated: 4,
      eyeContact: 5, confidence: 5, engagement: 5, createdAt: new Date('2026-03-26'),
    },
    {
      company: 'Amazon',       role: 'SDE',                        interviewType: 'Behavioral',    jobType: 'Full-time',
      overallScore: 4, answeredCount: 4, skippedCount: 1, totalFillers: 12, totalRepeated: 3,
      eyeContact: 5, confidence: 6, engagement: 6, createdAt: new Date('2026-03-27'),
    },
    {
      company: 'Microsoft',    role: 'Software Engineer',          interviewType: 'Technical',     jobType: 'Internship / Co-op',
      overallScore: 5, answeredCount: 4, skippedCount: 1, totalFillers: 10, totalRepeated: 2,
      eyeContact: 6, confidence: 6, engagement: 6, createdAt: new Date('2026-03-28'),
    },
    {
      company: 'Google',       role: 'Data Engineer',              interviewType: 'System Design', jobType: 'Full-time',
      overallScore: 6, answeredCount: 5, skippedCount: 0, totalFillers: 8,  totalRepeated: 2,
      eyeContact: 6, confidence: 7, engagement: 7, createdAt: new Date('2026-03-29'),
    },
    {
      company: 'Amazon',       role: 'Backend Engineer',           interviewType: 'Technical',     jobType: 'Full-time',
      overallScore: 7, answeredCount: 5, skippedCount: 0, totalFillers: 6,  totalRepeated: 1,
      eyeContact: 7, confidence: 7, engagement: 7, createdAt: new Date('2026-03-30'),
    },
    {
      company: 'Microsoft',    role: 'Program Manager',            interviewType: 'HR',            jobType: 'Full-time',
      overallScore: 7, answeredCount: 5, skippedCount: 0, totalFillers: 5,  totalRepeated: 1,
      eyeContact: 7, confidence: 7, engagement: 8, createdAt: new Date('2026-04-01'),
    },
    {
      company: 'Google',       role: 'Software Engineer',          interviewType: 'Behavioral',    jobType: 'Full-time',
      overallScore: 8, answeredCount: 5, skippedCount: 0, totalFillers: 3,  totalRepeated: 0,
      eyeContact: 8, confidence: 8, engagement: 8, createdAt: new Date('2026-04-03'),
    },
    {
      company: 'Microsoft',    role: 'Senior Software Engineer',   interviewType: 'System Design', jobType: 'Full-time',
      overallScore: 9, answeredCount: 5, skippedCount: 0, totalFillers: 2,  totalRepeated: 0,
      eyeContact: 8, confidence: 9, engagement: 9, createdAt: new Date('2026-04-05'),
    },
  ]

  for (const s of demoSessions) {
    await prisma.practiceSession.create({
      data: { ...s, userId: demoUser.nuid, verdict: verdict(s.overallScore) },
    })
  }

  console.log(`✓ Demo User sessions created (${demoSessions.length})`)

  // ── Test User sessions (consistent high scores: 7–9) ────────────────────────

  const testSessions = [
    {
      company: 'Meta',         role: 'Software Engineer',          interviewType: 'Technical',     jobType: 'Full-time',
      overallScore: 7, answeredCount: 5, skippedCount: 0, totalFillers: 3,  totalRepeated: 1,
      eyeContact: 7, confidence: 8, engagement: 7, createdAt: new Date('2026-03-26'),
    },
    {
      company: 'Apple',        role: 'iOS Engineer',               interviewType: 'Technical',     jobType: 'Full-time',
      overallScore: 8, answeredCount: 5, skippedCount: 0, totalFillers: 2,  totalRepeated: 0,
      eyeContact: 8, confidence: 8, engagement: 8, createdAt: new Date('2026-03-27'),
    },
    {
      company: 'Salesforce',   role: 'Software Engineer',          interviewType: 'Behavioral',    jobType: 'Full-time',
      overallScore: 7, answeredCount: 5, skippedCount: 0, totalFillers: 4,  totalRepeated: 1,
      eyeContact: 7, confidence: 7, engagement: 8, createdAt: new Date('2026-03-28'),
    },
    {
      company: 'Meta',         role: 'ML Engineer',                interviewType: 'System Design', jobType: 'Full-time',
      overallScore: 8, answeredCount: 5, skippedCount: 0, totalFillers: 2,  totalRepeated: 0,
      eyeContact: 8, confidence: 8, engagement: 9, createdAt: new Date('2026-03-29'),
    },
    {
      company: 'Apple',        role: 'Software Engineer',          interviewType: 'HR',            jobType: 'Full-time',
      overallScore: 9, answeredCount: 5, skippedCount: 0, totalFillers: 1,  totalRepeated: 0,
      eyeContact: 9, confidence: 9, engagement: 9, createdAt: new Date('2026-03-30'),
    },
    {
      company: 'Salesforce',   role: 'Backend Engineer',           interviewType: 'Technical',     jobType: 'Internship / Co-op',
      overallScore: 8, answeredCount: 5, skippedCount: 0, totalFillers: 3,  totalRepeated: 0,
      eyeContact: 8, confidence: 8, engagement: 8, createdAt: new Date('2026-04-01'),
    },
    {
      company: 'Meta',         role: 'Software Engineer',          interviewType: 'Behavioral',    jobType: 'Full-time',
      overallScore: 9, answeredCount: 5, skippedCount: 0, totalFillers: 2,  totalRepeated: 0,
      eyeContact: 9, confidence: 9, engagement: 8, createdAt: new Date('2026-04-03'),
    },
    {
      company: 'Apple',        role: 'Senior Software Engineer',   interviewType: 'System Design', jobType: 'Full-time',
      overallScore: 9, answeredCount: 5, skippedCount: 0, totalFillers: 1,  totalRepeated: 0,
      eyeContact: 9, confidence: 9, engagement: 9, createdAt: new Date('2026-04-05'),
    },
  ]

  for (const s of testSessions) {
    await prisma.practiceSession.create({
      data: { ...s, userId: testUser.nuid, verdict: verdict(s.overallScore) },
    })
  }

  console.log(`✓ Test User sessions created (${testSessions.length})`)
  console.log('\nDone! Login credentials:')
  console.log('  demo@northeastern.edu / Demo@123')
  console.log('  test@northeastern.edu / Demo@123')
}

main()
  .catch(err => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
