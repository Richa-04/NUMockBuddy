import { prisma } from '../lib/prisma'

async function main() {
  // ── Remove duplicate Alexis Wei entries, keep the first ──────────────────────

  const alexisEntries = await prisma.volunteer.findMany({
    where: { name: 'Alexis Wei' },
    orderBy: { createdAt: 'asc' },
  })

  if (alexisEntries.length > 1) {
    const [_keep, ...duplicates] = alexisEntries
    const duplicateIds = duplicates.map(v => v.id)

    // Delete availability slots first
    await prisma.availabilitySlot.deleteMany({
      where: { volunteerId: { in: duplicateIds } },
    })

    // Then delete related sessions
    await prisma.session.deleteMany({
      where: { volunteerId: { in: duplicateIds } },
    })

    // Then delete the duplicate volunteers
    await prisma.volunteer.deleteMany({
      where: { id: { in: duplicateIds } },
    })
    console.log(`✓ Removed ${duplicates.length} duplicate Alexis Wei entr${duplicates.length === 1 ? 'y' : 'ies'}`)
  } else {
    console.log('✓ No duplicate Alexis Wei entries found')
  }

  // ── Add availability slots to existing dummy volunteers ──────────────────────

  const dummyNames = ['James Park', 'Priya Sharma', 'Kevin Liu', 'Sofia Martinez', 'Raj Patel']

  const dummyVolunteers = await prisma.volunteer.findMany({
    where: { name: { in: dummyNames } },
  })

  const newSlots = [
    { day: '2026-03-26', startTime: '09:00', endTime: '10:00' },
    { day: '2026-03-26', startTime: '11:00', endTime: '12:00' },
    { day: '2026-03-26', startTime: '14:00', endTime: '15:00' },
    { day: '2026-03-26', startTime: '16:00', endTime: '17:00' },
    { day: '2026-03-27', startTime: '10:00', endTime: '11:00' },
    { day: '2026-03-27', startTime: '13:00', endTime: '14:00' },
    { day: '2026-03-27', startTime: '15:00', endTime: '16:00' },
  ]

  let totalSlots = 0
  for (const volunteer of dummyVolunteers) {
    for (const slot of newSlots) {
      await prisma.availabilitySlot.create({
        data: { volunteerId: volunteer.id, ...slot },
      })
    }
    totalSlots += newSlots.length
  }

  console.log(`✓ Added ${totalSlots} availability slots across ${dummyVolunteers.length} volunteers`)
}

main()
  .catch(err => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
