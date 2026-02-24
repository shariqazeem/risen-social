import { NextRequest, NextResponse } from 'next/server'
import { createProposal, getAllProposals, getProposalResults } from '@/lib/governance'

export async function POST(request: NextRequest) {
  try {
    const { creatorAddress, title, description, options, durationHours } = await request.json()

    if (!creatorAddress || !title || !description || !options || options.length < 2) {
      return NextResponse.json({
        error: 'creatorAddress, title, description, and at least 2 options required'
      }, { status: 400 })
    }

    const proposal = await createProposal(
      creatorAddress,
      title,
      description,
      options,
      durationHours || 72
    )

    return NextResponse.json({ success: true, proposal })
  } catch (error: any) {
    console.error('Create proposal error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const proposalId = searchParams.get('id')

    if (proposalId) {
      const results = await getProposalResults(proposalId)
      return NextResponse.json({ success: true, ...results })
    }

    const proposals = await getAllProposals()

    // Get results for each proposal
    const proposalsWithResults = await Promise.all(
      proposals.map(async (p: any) => {
        try {
          const results = await getProposalResults(p.id)
          return { ...p, results: results.results, totalVoters: results.totalVoters, totalWeight: results.totalWeight }
        } catch {
          return { ...p, results: [], totalVoters: 0, totalWeight: 0 }
        }
      })
    )

    return NextResponse.json({ success: true, proposals: proposalsWithResults })
  } catch (error: any) {
    console.error('Get proposals error:', error)
    return NextResponse.json({ success: true, proposals: [] })
  }
}
