import { NextRequest, NextResponse } from 'next/server'
import { recordImpactNFT, buildNFTMetadata, getTier } from '@/lib/nft'

export async function POST(request: NextRequest) {
  try {
    const { ownerAddress, causeName, amount, donationId, signature } = await request.json()

    if (!ownerAddress || !causeName || !amount) {
      return NextResponse.json({
        error: 'ownerAddress, causeName, and amount required'
      }, { status: 400 })
    }

    // Record the Impact NFT in our database
    const nft = await recordImpactNFT(
      ownerAddress,
      causeName,
      amount,
      donationId,
      signature
    )

    // Build metadata (for future on-chain minting)
    const tier = getTier(amount)
    const metadata = buildNFTMetadata(causeName, amount, tier, ownerAddress)

    return NextResponse.json({
      success: true,
      nft,
      metadata,
      tier,
    })
  } catch (error: any) {
    console.error('NFT mint error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
