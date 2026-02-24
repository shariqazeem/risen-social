import { NextRequest, NextResponse } from 'next/server'
import { findOrCreateProfile, getProfile, getProfileByWallet } from '@/lib/tapestry'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, username, bio } = await request.json()

    if (!walletAddress || !username) {
      return NextResponse.json({ error: 'walletAddress and username required' }, { status: 400 })
    }

    const profile = await findOrCreateProfile(walletAddress, username, bio)
    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    console.error('Tapestry profile error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const walletAddress = searchParams.get('walletAddress')

    if (username) {
      const profile = await getProfile(username)
      return NextResponse.json({ success: true, profile })
    }

    if (walletAddress) {
      const profile = await getProfileByWallet(walletAddress)
      return NextResponse.json({ success: true, profile })
    }

    return NextResponse.json({ error: 'username or walletAddress required' }, { status: 400 })
  } catch (error: any) {
    console.error('Tapestry profile fetch error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
