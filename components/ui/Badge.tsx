import { CSSProperties, ReactNode } from 'react'

type BadgeVariant = 'default' | 'red' | 'green' | 'outline'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  style?: CSSProperties
}

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  default: {
    background: 'var(--color-gray-100)',
    color: 'var(--color-gray-600)',
    border: '1px solid var(--color-gray-200)',
  },
  red: {
    background: 'var(--color-red-muted)',
    color: 'var(--color-red)',
    border: '1px solid var(--color-red-border)',
  },
  green: {
    background: 'rgba(22, 163, 74, 0.08)',
    color: '#16A34A',
    border: '1px solid rgba(22, 163, 74, 0.2)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-gray-600)',
    border: '1px solid var(--color-gray-200)',
  },
}

export default function Badge({ children, variant = 'default', style }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.5,
      whiteSpace: 'nowrap',
      ...variantStyles[variant],
      ...style,
    }}>
      {children}
    </span>
  )
}