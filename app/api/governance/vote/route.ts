import { NextRequest, NextResponse } from 'next/server'
import { castVote } from '@/lib/governance'

export async function POST(request: NextRequest) {
  try {
    const { proposalId, voterAddress, voteOption } = await request.json()

    if (!proposalId || !voterAddress || voteOption === undefined) {
      return NextResponse.json({
        error: 'proposalId, voterAddress, and voteOption required'
      }, { status: 400 })
    }

    const result = await castVote(proposalId, voterAddress, voteOption)
    return NextResponse.json({ success: true, voteWeight: result.voteWeight })
  } catch (error: any) {
    console.error('Vote error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
