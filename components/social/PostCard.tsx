'use client'

import { useState } from 'react'

interface Post {
  id: string
  username: string
  content: string
  properties?: Record<string, string>
  createdAt?: string
  likes?: number
  comments?: number
}

interface PostCardProps {
  post: Post
  currentUsername: string | null
}

export function PostCard({ post, currentUsername }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes || 0)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<any[]>([])
  const [loadingLike, setLoadingLike] = useState(false)

  const handleLike = async () => {
    if (!currentUsername || loadingLike) return
    setLoadingLike(true)
    try {
      if (liked) {
        await fetch('/api/social/like', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUsername, contentId: post.id }),
        })
        setLikeCount((c) => Math.max(0, c - 1))
      } else {
        await fetch('/api/social/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUsername, contentId: post.id }),
        })
        setLikeCount((c) => c + 1)
      }
      setLiked(!liked)
    } catch {
      // Silently fail
    } finally {
      setLoadingLike(false)
    }
  }

  const handleComment = async () => {
    if (!currentUsername || !commentText.trim()) return
    try {
      await fetch('/api/social/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUsername,
          contentId: post.id,
          text: commentText.trim(),
        }),
      })
      setComments((prev) => [...prev, { username: currentUsername, text: commentText.trim() }])
      setCommentText('')
    } catch {
      // Silently fail
    }
  }

  const loadComments = async () => {
    if (!showComments) {
      try {
        const res = await fetch(`/api/social/comment?contentId=${post.id}`)
        const data = await res.json()
        if (data.comments) setComments(data.comments)
      } catch {
        // Empty comments
      }
    }
    setShowComments(!showComments)
  }

  const isDonationPost = post.properties?.type === 'donation' || post.content.includes('Donated')
  const isTipPost = post.properties?.type === 'tip' || post.content.includes('Sent')

  return (
    <div className="card p-5 mb-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-[#111] flex items-center justify-center">
          <span className="text-xs font-semibold text-white">
            {post.username?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">@{post.username}</p>
          {post.createdAt && (
            <p className="text-[10px] text-gray-400">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
        {isDonationPost && (
          <span className="pill bg-emerald-50 text-emerald-600 text-[10px]">Donation</span>
        )}
        {isTipPost && (
          <span className="pill bg-purple-50 text-purple-600 text-[10px]">Tip</span>
        )}
      </div>

      <p className="text-[15px] text-gray-800 leading-relaxed mb-4">{post.content}</p>

      <div className="flex items-center gap-5 pt-3 border-t border-black/[0.03]">
        <button
          onClick={handleLike}
          disabled={!currentUsername}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          } disabled:opacity-40`}
        >
          <span>{liked ? '❤️' : '♡'}</span>
          <span>{likeCount}</span>
        </button>

        <button
          onClick={loadComments}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span>💬</span>
          <span>{comments.length || post.comments || 0}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-t border-black/[0.03]">
          {comments.length > 0 && (
            <div className="space-y-2 mb-3">
              {comments.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[9px] font-medium text-gray-500">{c.username?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium">@{c.username}</span>
                    <p className="text-xs text-gray-500">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentUsername && (
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                maxLength={280}
                className="input flex-1 !py-2.5 !px-3.5 !text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="btn-primary px-4 py-2 text-xs"
              >
                Post
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
