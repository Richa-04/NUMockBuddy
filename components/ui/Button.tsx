import { CSSProperties, ReactNode, MouseEventHandler } from 'react'
import Link from 'next/link'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  style?: CSSProperties
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const variantMap: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: 'var(--color-red)',
    color: '#fff',
    border: '1.5px solid var(--color-red)',
    boxShadow: 'var(--shadow-red)',
  },
  secondary: {
    background: 'var(--color-black)',
    color: '#fff',
    border: '1.5px solid var(--color-black)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-gray-600)',
    border: '1.5px solid transparent',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-black)',
    border: '1.5px solid var(--color-gray-200)',
  },
}

const sizeMap: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '6px 16px', fontSize: 13, borderRadius: 'var(--radius-full)', height: 34 },
  md: { padding: '9px 22px', fontSize: 14, borderRadius: 'var(--radius-full)', height: 42 },
  lg: { padding: '12px 28px', fontSize: 15, borderRadius: 'var(--radius-full)', height: 50 },
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  style,
  disabled,
  type = 'button',
  fullWidth,
}: ButtonProps) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    ...variantMap[variant],
    ...sizeMap[size],
    ...style,
  }

  if (href) {
    return <Link href={href} style={base}>{children}</Link>
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={base}>
      {children}
    </button>
  )
}