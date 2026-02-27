import { NextRequest, NextResponse } from 'next/server'
import { getSuggestedProfiles, getTapestryLeaderboard, searchProfiles } from '@/lib/tapestry'

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get('username')
    if (!username) {
      return NextResponse.json({ profiles: [] })
    }

    // Try suggested profiles first
    let rawProfiles: any[] = []
    try {
      rawProfiles = await getSuggestedProfiles(username)
    } catch {
      // User may not exist yet on Tapestry — that's fine
    }

    // Fallback 1: leaderboard (namespace is 'risen')
    if (!rawProfiles || rawProfiles.length === 0) {
      try {
        const leaderboard = await getTapestryLeaderboard('risen')
        const entries = leaderboard?.entries || leaderboard?.profiles || leaderboard || []
        rawProfiles = (Array.isArray(entries) ? entries : []).slice(0, 10)
      } catch {
        // fallback failed
      }
    }

    // Fallback 2: search for common letters
    if (!rawProfiles || rawProfiles.length === 0) {
      try {
        rawProfiles = await searchProfiles('a')
      } catch {
        // search failed
      }
    }

    // Normalize Tapestry profile data
    const profiles = (rawProfiles || [])
      .map((p: any) => ({
        username: p.username || p.id || p.profile?.username || '',
        bio: p.bio || p.profile?.bio || '',
      }))
      .filter((p: any) => p.username && p.username !== username)

    return NextResponse.json({ profiles })
  } catch (error) {
    console.error('Suggested profiles error:', error)
    return NextResponse.json({ profiles: [] })
  }
}
