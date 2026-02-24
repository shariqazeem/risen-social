'use client'

interface ImpactNFT {
  id: string
  owner_address: string
  cause_name: string
  amount: number
  tier: string
  mint_signature?: string
  created_at: string
}

const TIER_CONFIG: Record<string, { label: string; bg: string; accent: string; emoji: string }> = {
  bronze: { label: 'Bronze', bg: 'bg-amber-50', accent: 'text-amber-600', emoji: '🥉' },
  silver: { label: 'Silver', bg: 'bg-gray-50', accent: 'text-gray-500', emoji: '🥈' },
  gold: { label: 'Gold', bg: 'bg-yellow-50', accent: 'text-yellow-600', emoji: '🥇' },
  diamond: { label: 'Diamond', bg: 'bg-blue-50', accent: 'text-blue-500', emoji: '💎' },
}

export function NFTCard({ nft }: { nft: ImpactNFT }) {
  const tier = TIER_CONFIG[nft.tier] || TIER_CONFIG.bronze

  return (
    <div className="card overflow-hidden group">
      <div className={`${tier.bg} p-8 text-center relative transition-all group-hover:py-9`}>
        <div className="text-4xl mb-2">{tier.emoji}</div>
        <div className={`text-[10px] font-semibold ${tier.accent} uppercase tracking-[0.2em]`}>
          {tier.label} Impact
        </div>
        <span className="absolute top-3 right-3 pill bg-white/70 text-gray-500 !text-[9px]">
          Soulbound
        </span>
      </div>

      <div className="p-5">
        <p className="font-semibold text-sm mb-3">{nft.cause_name}</p>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-gray-400">Amount</span>
            <span className="text-sm font-bold counter">{nft.amount} SOL</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-gray-400">Owner</span>
            <span className="text-[11px] font-mono text-gray-500">
              {nft.owner_address.slice(0, 4)}...{nft.owner_address.slice(-4)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-gray-400">Date</span>
            <span className="text-[11px] text-gray-500">{new Date(nft.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {nft.mint_signature && (
          <a
            href={`https://solscan.io/tx/${nft.mint_signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            View transaction
          </a>
        )}
      </div>
    </div>
  )
}
