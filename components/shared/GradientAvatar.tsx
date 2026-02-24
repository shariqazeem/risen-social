'use client'

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

function getGradientColors(username: string): [string, string] {
  const hash = hashCode(username)
  const hue1 = hash % 360
  const hue2 = (hash * 137) % 360
  return [`hsl(${hue1}, 70%, 65%)`, `hsl(${hue2}, 65%, 55%)`]
}

const SIZES = {
  sm: { container: 'w-6 h-6', text: 'text-[9px]' },
  md: { container: 'w-8 h-8', text: 'text-[11px]' },
  lg: { container: 'w-10 h-10', text: 'text-sm' },
  xl: { container: 'w-14 h-14', text: 'text-xl' },
} as const

interface GradientAvatarProps {
  username: string
  size?: keyof typeof SIZES
  className?: string
}

export function GradientAvatar({ username, size = 'md', className = '' }: GradientAvatarProps) {
  const [color1, color2] = getGradientColors(username || 'unknown')
  const { container, text } = SIZES[size]
  const letter = (username || '?').charAt(0).toUpperCase()

  return (
    <div
      className={`${container} rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
    >
      <span className={`${text} font-semibold text-white`}>{letter}</span>
    </div>
  )
}
