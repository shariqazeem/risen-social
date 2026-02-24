import { NextRequest, NextResponse } from 'next/server'
import { createLike, removeLike, checkLike } from '@/lib/tapestry'

export async function POST(request: NextRequest) {
  try {
    const { username, contentId } = await request.json()

    if (!username || !contentId) {
      return NextResponse.json({ error: 'username and contentId required' }, { status: 400 })
    }

    // username is the profileId in Tapestry
    await createLike(username, contentId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Like error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { username, contentId } = await request.json()

    if (!username || !contentId) {
      return NextResponse.json({ error: 'username and contentId required' }, { status: 400 })
    }

    await removeLike(username, contentId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Unlike error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const contentId = searchParams.get('contentId')

    if (!username || !contentId) {
      return NextResponse.json({ isLiked: false })
    }

    const isLiked = await checkLike(username, contentId)
    return NextResponse.json({ success: true, isLiked })
  } catch {
    return NextResponse.json({ success: false, isLiked: false })
  }
}
