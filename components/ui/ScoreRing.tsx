interface ScoreRingProps {
  score: number
  size?: number
  label?: string
}

function getScoreColor(score: number) {
  if (score >= 8) return '#16A34A'
  if (score >= 6.5) return '#D97706'
  return '#C8102E'
}

function getScoreLabel(score: number) {
  if (score >= 8) return 'Strong'
  if (score >= 6.5) return 'Good'
  return 'Needs work'
}

export default function ScoreRing({ score, size = 44, label }: ScoreRingProps) {
  const color = getScoreColor(score)
  const scoreLabel = label ?? getScoreLabel(score)
  const r = (size / 2) - 4
  const circumference = 2 * Math.PI * r
  const progress = (score / 10) * circumference

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-gray-200)" strokeWidth={3} />
          <circle
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <span style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.28,
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}>
          {score}
        </span>
      </div>
      {label !== undefined ? null : (
        <span style={{ fontSize: 13, fontWeight: 500, color }}>
          {scoreLabel}
        </span>
      )}
    </div>
  )
}