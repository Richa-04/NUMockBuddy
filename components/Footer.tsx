import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--color-gray-200)',
      padding: 'var(--space-2xl) var(--space-lg) var(--space-xl)',
      background: 'var(--color-gray-100)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-2xl)',
          marginBottom: 'var(--space-2xl)',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                background: 'var(--color-red)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
              }}>N</div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>
NUMockBuddy</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-gray-400)', lineHeight: 1.6, maxWidth: 240 }}>
              AI-powered interview prep built by NU students, for NU students.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Platform</p>
            {['Practice', 'Volunteers', 'Resume Analyzer', 'Dashboard'].map(item => (
              <Link key={item} href="#" style={{ display: 'block', fontSize: 14, color: 'var(--color-gray-600)', textDecoration: 'none', marginBottom: 8, lineHeight: 1.4 }}>
                {item}
              </Link>
            ))}
          </div>

          {/* Resources */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Resources</p>
            {['Company Prep Guides', 'Interview Tips', 'Become a Volunteer', 'NU Career Center'].map(item => (
              <Link key={item} href="#" style={{ display: 'block', fontSize: 14, color: 'var(--color-gray-600)', textDecoration: 'none', marginBottom: 8, lineHeight: 1.4 }}>
                {item}
              </Link>
            ))}
          </div>

          {/* Built by */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Built by</p>
            {['Mansi Singh', 'Jia Wei', 'Richa Padhariya', 'Aparajita Sharma'].map(name => (
              <p key={name} style={{ fontSize: 14, color: 'var(--color-gray-600)', marginBottom: 6 }}>{name}</p>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--color-gray-200)',
          paddingTop: 'var(--space-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>
            © 2026 NUMockBuddy · Northeastern University Seattle
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#C8102E', '#111'].map((c, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: 99, background: c }} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}