'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { FeedPostCard } from './FeedPostCard'
import { FeedComposer } from './FeedComposer'
import { FeedProposalCard } from './FeedProposalCard'
import { ImpactDare } from './ImpactDare'
import { GradientAvatar } from '@/components/shared/GradientAvatar'

interface FeedItem {
  type: 'post' | 'donation_event' | 'proposal' | 'trending' | 'suggested_follow'
  id: string
  data: Record<string, unknown>
  timestamp?: string
}

export function SmartFeed({ guestMode = false }: { guestMode?: boolean } = {}) {
  const { publicKey } = useWallet()
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (publicKey) checkProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey])

  const checkProfile = async () => {
    if (!publicKey) return
    try {
      const res = await fetch(`/api/register/check?address=${publicKey.toBase58()}`)
      const data = await res.json()
      if (data.registered && data.user) {
        setCurrentUsername(data.user.username)
      }
    } catch {
      // Not registered
    }
  }

  const fetchFeed = useCallback(async () => {
    if (guestMode || !currentUsername) {
      try {
        const res = await fetch('/api/social/feed')
        const data = await res.json()
        if (data.posts && data.posts.length > 0) {
          setFeed(data.posts.map((p: Record<string, unknown>) => ({
            type: 'post' as const,
            id: p.id as string,
            data: p,
            timestamp: p.createdAt as string,
          })))
        } else {
          const res2 = await fetch('/api/feed/smart?username=__global__')
          const data2 = await res2.json()
          if (data2.feed) {
            setFeed(data2.feed)
          }
        }
      } catch {
        // Empty
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
      return
    }

    try {
      const addressParam = publicKey ? `&address=${publicKey.toBase58()}` : ''
      const res = await fetch(`/api/feed/smart?username=${currentUsername}${addressParam}`)
      const data = await res.json()
      if (data.feed) {
        setFeed(data.feed)
      }
    } catch {
      // Empty feed
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentUsername, publicKey, guestMode])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchFeed()
  }

  const handlePostCreated = useCallback((content: string) => {
    if (!currentUsername) return
    const optimisticPost: FeedItem = {
      type: 'post',
      id: `optimistic_${Date.now()}`,
      data: {
        username: currentUsername,
        profileId: currentUsername,
        content,
        properties: { type: 'manual' },
        likeCount: 0,
        commentCount: 0,
      },
      timestamp: new Date().toISOString(),
    }
    setFeed(prev => [optimisticPost, ...prev])
  }, [currentUsername])

  const renderFeedItem = (item: FeedItem) => {
    switch (item.type) {
      case 'proposal':
        return (
          <FeedProposalCard
            key={item.id}
            proposal={item.data as FeedItem['data'] & {
              id: string; title: string; description: string; options: string[];
              status: string; total_votes: number; created_at: string; closes_at: string;
            }}
            voterAddress={publicKey?.toBase58() || ''}
            onVoted={fetchFeed}
          />
        )

      case 'suggested_follow':
        return <SuggestedFollowCard key={item.id} profile={item.data} currentUsername={currentUsername} />

      case 'post':
      case 'donation_event':
      case 'trending':
      default:
        return (
          <FeedPostCard
            key={item.id}
            post={item}
            currentUsername={currentUsername}
            guestMode={guestMode}
          />
        )
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Feed Header */}
      <div className="mb-5 pt-1">
        <h2 className="text-2xl font-bold tracking-[-0.02em] mb-0.5">Feed</h2>
        <p className="text-[#86868b] text-[13px]">Your network&apos;s impact, live.</p>
      </div>

      {/* Composer */}
      {currentUsername && (
        <div className="mb-3">
          <FeedComposer username={currentUsername} onPostCreated={handlePostCreated} />
        </div>
      )}

      {currentUsername && (
        <div className="mb-3">
          <ImpactDare currentUsername={currentUsername} onDareCreated={fetchFeed} />
        </div>
      )}

      {!currentUsername && !guestMode && (
        <div className="card p-4 mb-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center flex-shrink-0">
            <span className="text-xs">✦</span>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium">Register to post</p>
            <p className="text-[11px] text-[#86868b]">Connect your wallet and create a profile.</p>
          </div>
        </div>
      )}

      {/* Feed Items */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-[20px]" />
            ))}
          </div>
        ) : feed.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">✦</span>
            </div>
            <p className="text-[#1d1d1f] font-semibold text-[15px] mb-1">Your feed is empty</p>
            <p className="text-[#86868b] text-[13px]">Follow people and donate to see activity.</p>
          </div>
        ) : (
          <div className="animate-stagger">
            {feed.map(renderFeedItem)}
          </div>
        )}
      </div>

      {/* Refresh */}
      {feed.length > 0 && (
        <div className="mt-5 text-center">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-ghost px-4 py-2 text-[12px] font-medium"
          >
            {refreshing ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-[1.5px] border-[#aeaeb2] border-t-[#1d1d1f] rounded-full animate-spin" />
                Refreshing
              </span>
            ) : 'Refresh feed'}
          </button>
        </div>
      )}
    </div>
  )
}

function SuggestedFollowCard({ profile, currentUsername }: { profile: Record<string, unknown>; currentUsername: string | null }) {
  const [followed, setFollowed] = useState(false)
  const [loading, setLoading] = useState(false)

  const username = (profile.username as string) || 'unknown'
  const bio = (profile.bio as string) || ''

  const handleFollow = async () => {
    if (!currentUsername || loading) return
    setLoading(true)
    try {
      await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ follower: currentUsername, followee: username }),
      })
      setFollowed(true)
    } catch {
      // fail silently
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-4 mb-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-blue-500 mb-2.5">Suggested for you</p>
      <div className="flex items-center gap-3">
        <GradientAvatar username={username} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium">@{username}</p>
          {bio && <p className="text-[11px] text-[#86868b] truncate">{bio}</p>}
        </div>
        <button
          onClick={handleFollow}
          disabled={followed || loading || !currentUsername}
          className={`px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
            followed
              ? 'bg-[#f5f5f7] text-[#86868b]'
              : 'btn-primary'
          }`}
        >
          {followed ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>
  )
}
