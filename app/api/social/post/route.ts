import { NextRequest, NextResponse } from 'next/server'
import { createPost, getPostsByProfile } from '@/lib/tapestry'

export async function POST(request: NextRequest) {
  try {
    const { username, content, properties } = await request.json()

    if (!username || !content) {
      return NextResponse.json({ error: 'username and content required' }, { status: 400 })
    }

    // username is used as profileId in Tapestry
    const post = await createPost(username, content, properties)
    return NextResponse.json({ success: true, post })
  } catch (error: any) {
    console.error('Create post error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'username required' }, { status: 400 })
    }

    const posts = await getPostsByProfile(username)
    return NextResponse.json({ success: true, posts: posts || [] })
  } catch (error: any) {
    console.error('Get posts error:', error)
    return NextResponse.json({ success: true, posts: [] })
  }
}
