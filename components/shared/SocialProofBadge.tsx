'use client'

import { GradientAvatar } from './GradientAvatar'

interface SocialProofBadgeProps {
  usernames: string[]
  action?: string
  className?: string
}

export function SocialProofBadge({ usernames, action = 'donated', className = '' }: SocialProofBadgeProps) {
  if (usernames.length === 0) return null

  const shown = usernames.slice(0, 3)
  const remaining = usernames.length - shown.length

  const names = shown.length === 1
    ? shown[0]
    : shown.length === 2
      ? `${shown[0]} and ${shown[1]}`
      : `${shown[0]}, ${shown[1]}`

  const suffix = remaining > 0 ? ` and ${remaining} other${remaining > 1 ? 's' : ''} you follow` : ' you follow'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex -space-x-1.5">
        {shown.map((u) => (
          <GradientAvatar key={u} username={u} size="sm" className="ring-2 ring-white" />
        ))}
      </div>
      <span className="text-[11px] text-gray-400">
        {names}{suffix} {action}
      </span>
    </div>
  )
}
