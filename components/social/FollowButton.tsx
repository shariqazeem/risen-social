'use client'

import { useState, useEffect } from 'react'

interface FollowButtonProps {
  currentUsername: string
  targetUsername: string
}

export function FollowButton({ currentUsername, targetUsername }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkFollowStatus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUsername, targetUsername])

  const checkFollowStatus = async () => {
    try {
      const res = await fetch(`/api/social/follow?follower=${currentUsername}&followee=${targetUsername}`)
      const data = await res.json()
      setIsFollowing(data.isFollowing || false)
    } catch {
      // Not following
    }
  }

  const toggleFollow = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (isFollowing) {
        await fetch('/api/social/follow', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            followerId: currentUsername,
            followeeId: targetUsername,
          }),
        })
      } else {
        await fetch('/api/social/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            followerId: currentUsername,
            followeeId: targetUsername,
          }),
        })
      }
      setIsFollowing(!isFollowing)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }

  if (currentUsername === targetUsername) return null

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
        isFollowing
          ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
          : 'btn-primary'
      } disabled:opacity-50`}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
