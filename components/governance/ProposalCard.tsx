'use client'

import { useState } from 'react'

interface ProposalResult {
  option: string
  index: number
  voteCount: number
  totalWeight: number
  percentage: number
}

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
  results?: ProposalResult[]
  totalVoters?: number
  totalWeight?: number
}

interface ProposalCardProps {
  proposal: Proposal
  voterAddress: string
  onVoted: () => void
}

export function ProposalCard({ proposal, voterAddress, onVoted }: ProposalCardProps) {
  const [voting, setVoting] = useState(false)
  const [voted, setVoted] = useState(false)
  const [error, setError] = useState('')

  const isExpired = new Date(proposal.closes_at) < new Date()
  const isActive = proposal.status === 'active' && !isExpired

  const timeLeft = () => {
    const diff = new Date(proposal.closes_at).getTime() - Date.now()
    if (diff <= 0) return 'Ended'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d ${hours % 24}h left`
    return `${hours}h left`
  }

  const handleVote = async (optionIndex: number) => {
    if (voting || voted || !voterAddress) return
    setVoting(true)
    setError('')
    try {
      const res = await fetch('/api/governance/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: proposal.id,
          voterAddress,
          voteOption: optionIndex,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setVoted(true)
        onVoted()
      }
    } catch {
      setError('Failed to cast vote')
    } finally {
      setVoting(false)
    }
  }

  const results = proposal.results && proposal.results.length > 0
    ? proposal.results
    : proposal.options.map((opt, i) => ({
        option: opt,
        index: i,
        voteCount: 0,
        totalWeight: 0,
        percentage: 0,
      }))

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-semibold mb-1">{proposal.title}</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{proposal.description}</p>
        </div>
        <span className={`pill flex-shrink-0 text-[10px] ${
          isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
        }`}>
          {isActive ? timeLeft() : 'Ended'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {results.map((result) => (
          <button
            key={result.index}
            onClick={() => handleVote(result.index)}
            disabled={!isActive || voted || voting}
            className={`w-full text-left rounded-2xl p-4 transition-all relative overflow-hidden ${
              isActive && !voted
                ? 'border-2 border-gray-100 hover:border-[#111] cursor-pointer'
                : 'border border-gray-50'
            } disabled:cursor-default`}
          >
            <div
              className="absolute inset-0 bg-gray-50 transition-all duration-700"
              style={{ width: `${result.percentage || 0}%` }}
            />
            <div className="relative flex justify-between items-center">
              <span className="text-sm font-medium">{result.option}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">{result.voteCount}</span>
                <span className="text-xs font-bold counter">
                  {result.percentage?.toFixed(0) || 0}%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-xs mb-3">{error}</p>
      )}

      <div className="flex justify-between items-center text-[11px] text-gray-400 pt-3 border-t border-black/[0.03]">
        <span>{proposal.totalVoters || 0} voters · {proposal.totalWeight || 0} weight</span>
        <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
