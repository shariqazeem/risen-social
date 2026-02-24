'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { ProposalCard } from './ProposalCard'
import { CreateProposal } from './CreateProposal'

interface Proposal {
  id: string
  creator_address: string
  title: string
  description: string
  options: string[]
  status: string
  total_votes: number
  created_at: string
  closes_at: string
  results?: { option: string; index: number; voteCount: number; totalWeight: number; percentage: number }[]
  totalVoters?: number
  totalWeight?: number
}

export function GovernancePanel() {
  const { publicKey } = useWallet()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [userPoints, setUserPoints] = useState(0)

  useEffect(() => {
    fetchProposals()
    if (publicKey) fetchUserPoints()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey])

  const fetchProposals = async () => {
    try {
      const res = await fetch('/api/governance/proposals')
      const data = await res.json()
      if (data.proposals) setProposals(data.proposals)
    } catch {
      // Empty
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPoints = async () => {
    if (!publicKey) return
    try {
      const res = await fetch(`/api/register/check?address=${publicKey.toBase58()}`)
      const data = await res.json()
      if (data.user) setUserPoints(data.user.reward_points || data.user.rewardPoints || 0)
    } catch {
      // No points
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 pt-2">
        <h2 className="text-3xl font-bold tracking-tight mb-1">Governance</h2>
        <p className="text-gray-400 text-sm">Vote on where community funds go. Your reward points = your voting power.</p>
      </div>

      {/* Voting Power Card */}
      <div className="card p-6 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Your voting power</p>
            <p className="text-3xl font-bold counter">{userPoints}</p>
            <p className="text-[11px] text-gray-400 mt-1">
              {userPoints >= 100 ? 'You can create proposals' : `${Math.max(0, 100 - userPoints)} more points to create proposals`}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            disabled={userPoints < 100}
            className="btn-primary py-2.5 px-6 text-xs"
          >
            New proposal
          </button>
        </div>
      </div>

      {showCreate && (
        <CreateProposal
          creatorAddress={publicKey?.toBase58() || ''}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            fetchProposals()
          }}
        />
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-44" />)}
        </div>
      ) : proposals.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-gray-400 text-sm">No proposals yet.</p>
          <p className="text-gray-300 text-xs mt-1">Earn 100+ points by donating to create one.</p>
        </div>
      ) : (
        <div className="space-y-3 animate-stagger">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              voterAddress={publicKey?.toBase58() || ''}
              onVoted={fetchProposals}
            />
          ))}
        </div>
      )}
    </div>
  )
}
