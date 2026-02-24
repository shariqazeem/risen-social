'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PostCard } from './PostCard'
import { CreatePost } from './CreatePost'
import { ProfileCard } from './ProfileCard'

interface Post {
  id: string
  username: string
  content: string
  properties?: Record<string, string>
  createdAt?: string
  likes?: number
  comments?: number
}

export function SocialFeed() {
  const { publicKey } = useWallet()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)

  useEffect(() => {
    fetchFeed()
    if (publicKey) {
      checkProfile()
    }
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
      // User not registered yet
    }
  }

  const fetchFeed = async () => {
    try {
      const res = await fetch('/api/social/feed')
      const data = await res.json()
      if (data.posts) {
        setPosts(data.posts)
      }
    } catch {
      // Empty feed
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 pt-2">
        <h2 className="text-3xl font-bold tracking-tight mb-1">Feed</h2>
        <p className="text-gray-400 text-sm">See what the community is doing on-chain.</p>
      </div>

      {currentUsername && (
        <div className="mb-4">
          <ProfileCard username={currentUsername} />
        </div>
      )}

      {currentUsername && (
        <div className="mb-4">
          <CreatePost username={currentUsername} onPostCreated={fetchFeed} />
        </div>
      )}

      {!currentUsername && (
        <div className="card p-5 mb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm">✦</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Register to post</p>
            <p className="text-xs text-gray-400">Create a profile in the Donate tab to start posting.</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-36" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-gray-400 text-sm">No posts yet.</p>
            <p className="text-gray-300 text-xs mt-1">Donations automatically create social posts.</p>
          </div>
        ) : (
          <div className="animate-stagger">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUsername={currentUsername}
              />
            ))}
          </div>
        )}
      </div>

      {posts.length > 0 && (
        <div className="mt-6 text-center">
          <button onClick={fetchFeed} className="btn-ghost px-4 py-2 text-xs">
            Refresh feed
          </button>
        </div>
      )}
    </div>
  )
}
