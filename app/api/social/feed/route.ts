import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts, getPostsByProfile } from '@/lib/tapestry'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    let rawPosts
    if (username) {
      rawPosts = await getPostsByProfile(username)
    } else {
      rawPosts = await getAllPosts()
    }

    // Transform Tapestry format to our Post format
    const posts = (rawPosts || []).map((item: any) => {
      const content = item.content || item
      const author = item.authorProfile || {}
      const counts = item.socialCounts || {}

      // Extract properties into a flat object
      const properties: Record<string, string> = {}
      if (content.type) properties.type = content.type
      if (content.contentType) properties.contentType = content.contentType

      return {
        id: content.id || content.externalLinkURL || '',
        username: author.username || author.id || content.profileId || 'unknown',
        content: content.content || '',
        properties,
        createdAt: content.created_at ? new Date(content.created_at).toISOString() : undefined,
        likes: counts.likeCount || 0,
        comments: counts.commentCount || 0,
      }
    })

    return NextResponse.json({ success: true, posts })
  } catch (error: any) {
    console.error('Feed error:', error)
    return NextResponse.json({ success: true, posts: [] })
  }
}
