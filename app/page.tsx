'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/wallet/WalletButton'
import { DonationPools } from '@/components/donation/DonationPools'
import { OneTapDonation } from '@/components/donation/OneTapDonation'
import { TippingSystem } from '@/components/tips/TippingSystem'
import { Leaderboard } from '@/components/leaderboard/Leaderboard'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { SmartFeed } from '@/components/feed/SmartFeed'
import { ExplorePage } from '@/components/explore/ExplorePage'
import { ProfilePage } from '@/components/profile/ProfilePage'
import { GovernancePanel } from '@/components/governance/GovernancePanel'
import { GradientAvatar } from '@/components/shared/GradientAvatar'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { UmanityAgent } from '@/components/ai/UmanityAgent'
import { LiveTicker } from '@/components/feed/LiveTicker'

const TABS = [
  { id: 'feed' as const, label: 'Feed', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )},
  { id: 'explore' as const, label: 'Explore', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )},
  { id: 'donate' as const, label: 'Donate', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  )},
  { id: 'govern' as const, label: 'Govern', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )},
  { id: 'profile' as const, label: 'Profile', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )},
] as const

type TabId = typeof TABS[number]['id']

export default function Home() {
  const { publicKey } = useWallet()
  const [activeTab, setActiveTab] = useState<TabId>('feed')
  const [isRegistered, setIsRegistered] = useState(false)
  const [registeredUsername, setRegisteredUsername] = useState('')
  const [checking, setChecking] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [referrer, setReferrer] = useState('')
  const [guestMode, setGuestMode] = useState(false)

  const checkRegistration = useCallback(async () => {
    if (!publicKey) return
    setChecking(true)
    try {
      const res = await fetch(`/api/register/check?address=${publicKey.toBase58()}`)
      const data = await res.json()
      setIsRegistered(data.registered)
      if (data.registered && data.user?.username) {
        setRegisteredUsername(data.user.username)
      }
      if (!data.registered) {
        setShowOnboarding(true)
      }
    } catch {
      setShowOnboarding(true)
    } finally {
      setChecking(false)
    }
  }, [publicKey])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) setReferrer(ref)
  }, [])

  useEffect(() => {
    if (publicKey) {
      setGuestMode(false)
      checkRegistration()
    } else {
      setIsRegistered(false)
      setRegisteredUsername('')
      setShowOnboarding(false)
      setChecking(false)
    }
  }, [publicKey, checkRegistration])

  /* ======== LANDING PAGE ======== */
  if (!publicKey && !guestMode) {
    return <LandingPage onGuestMode={() => setGuestMode(true)} />
  }

  /* ======== CHECKING STATE ======== */
  if (checking) {
    return (
      <div className="min-h-[100dvh] page-bg flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <div className="w-12 h-12 rounded-2xl bg-[#1d1d1f] flex items-center justify-center mx-auto mb-5">
            <span className="text-white text-sm font-black tracking-tight">U</span>
          </div>
          <div className="w-5 h-5 border-2 border-gray-200 border-t-[#1d1d1f] rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  /* ======== ONBOARDING ======== */
  if (showOnboarding && !isRegistered && !guestMode) {
    return <OnboardingScreen
      onComplete={() => { setIsRegistered(true); setShowOnboarding(false) }}
      referrer={referrer}
    />
  }

  /* ======== MAIN APP ======== */
  return (
    <div className="min-h-[100dvh] page-bg">
      {/* === MOBILE: Glass Header === */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="px-5 h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[9px] bg-[#1d1d1f] flex items-center justify-center">
              <span className="text-white text-[11px] font-black tracking-tight">U</span>
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.02em]">Umanity</span>
          </div>
          <div className="flex items-center gap-3">
            {guestMode && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-[10px] text-amber-600 font-medium">
                Guest
              </span>
            )}
            {publicKey && isRegistered && registeredUsername && (
              <NotificationBell
                address={publicKey.toBase58()}
                username={registeredUsername}
              />
            )}
            <WalletButton />
          </div>
        </div>
      </header>

      {/* === MOBILE: LiveTicker === */}
      <div className="lg:hidden">
        <LiveTicker />
      </div>

      {/* === MOBILE: Guest Banner === */}
      {guestMode && (
        <div className="lg:hidden bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-b border-amber-200/30">
          <div className="px-5 py-2 flex items-center justify-between">
            <p className="text-[11px] text-amber-700/80">Guest mode — connect wallet to donate & post</p>
            <WalletButton />
          </div>
        </div>
      )}

      {/* === MOBILE: Bottom Tab Bar === */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-black/[0.04] safe-area-bottom">
        <div className="flex items-center justify-around h-[52px] max-w-md mx-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center w-14 h-full transition-all duration-200 ${
                  isActive ? 'text-[#1d1d1f]' : 'text-[#aeaeb2]'
                }`}
              >
                <span className={`transition-transform duration-300 ${isActive ? 'scale-105' : ''}`}>
                  {tab.icon}
                </span>
                <span className={`text-[9px] font-medium mt-0.5 transition-colors ${isActive ? 'text-[#1d1d1f]' : 'text-[#aeaeb2]'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ============ DESKTOP: X-style 3-column layout ============ */}
      <div className="hidden lg:flex max-w-[1280px] mx-auto min-h-[100dvh]">

        {/* LEFT SIDEBAR — Fixed nav like X */}
        <aside className="w-[260px] flex-shrink-0 sticky top-0 h-[100dvh] flex flex-col border-r border-black/[0.04] px-3 py-5">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-3 mb-6">
            <div className="w-8 h-8 rounded-[10px] bg-[#1d1d1f] flex items-center justify-center">
              <span className="text-white text-[12px] font-black tracking-tight">U</span>
            </div>
            <span className="text-[16px] font-semibold tracking-[-0.02em]">Umanity</span>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-0.5">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[15px] transition-all duration-200 ${
                    isActive
                      ? 'text-[#1d1d1f] font-bold bg-black/[0.04]'
                      : 'text-[#525252] font-medium hover:bg-black/[0.03]'
                  }`}
                >
                  <span className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Devnet indicator */}
          <div className="px-3 mb-3">
            {guestMode ? (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Guest Mode
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-[#86868b] mb-2">
                <div className="pulse-dot" />
                Solana Devnet
              </div>
            )}
          </div>

          {/* Wallet & User */}
          <div className="px-2 space-y-2">
            {publicKey && isRegistered && registeredUsername && (
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
                <GradientAvatar username={registeredUsername} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">@{registeredUsername}</p>
                </div>
                <NotificationBell address={publicKey.toBase58()} username={registeredUsername} />
              </div>
            )}
            <WalletButton />
          </div>
        </aside>

        {/* CENTER — Main content feed */}
        <main className="flex-1 min-w-0 border-r border-black/[0.04]">
          {/* Desktop LiveTicker */}
          <LiveTicker />

          {/* Guest Banner Desktop */}
          {guestMode && (
            <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-b border-amber-200/30">
              <div className="px-5 py-2 flex items-center justify-between">
                <p className="text-[11px] text-amber-700/80">Browsing as guest — connect wallet to donate & post</p>
                <WalletButton />
              </div>
            </div>
          )}

          <div className="px-5 pt-4 pb-8">
            <div className="entrance-reveal">
              {activeTab === 'feed' && <SmartFeed guestMode={guestMode} />}
              {activeTab === 'explore' && <ExplorePage />}
              {activeTab === 'donate' && <DonateView guestMode={guestMode} />}
              {activeTab === 'govern' && <GovernancePanel />}
              {activeTab === 'profile' && (guestMode ? <GuestProfileView /> : <ProfilePage />)}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR — Widgets like X */}
        <aside className="w-[320px] flex-shrink-0 sticky top-0 h-[100dvh] overflow-y-auto px-5 py-5 space-y-4">
          {/* Stats Widget */}
          <DesktopStatsWidget />

          {/* Leaderboard Widget */}
          <div className="card p-4">
            <h3 className="font-bold text-[15px] mb-3">Top Donors</h3>
            <Leaderboard />
          </div>

          {/* Activity Widget */}
          <div className="card p-4">
            <h3 className="font-bold text-[15px] mb-3">Recent Activity</h3>
            <ActivityFeed />
          </div>

          {/* Built With */}
          <div className="px-2 pt-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#aeaeb2]">
              <span>Solana</span>
              <span>Tapestry</span>
              <span>Anchor</span>
              <span>Supabase</span>
            </div>
            <p className="text-[10px] text-[#d4d4d4] mt-2">&copy; 2025 Umanity</p>
          </div>
        </aside>
      </div>

      {/* === MOBILE: Main Content === */}
      <main className="lg:hidden px-5 pt-4 pb-24">
        <div className="entrance-reveal">
          {activeTab === 'feed' && <SmartFeed guestMode={guestMode} />}
          {activeTab === 'explore' && <ExplorePage />}
          {activeTab === 'donate' && <DonateView guestMode={guestMode} />}
          {activeTab === 'govern' && <GovernancePanel />}
          {activeTab === 'profile' && (guestMode ? <GuestProfileView /> : <ProfilePage />)}
        </div>
      </main>

      {!guestMode && <UmanityAgent />}
    </div>
  )
}

/* ===== PLATFORM STATS BAR ===== */
function StatsBar() {
  const [stats, setStats] = useState<{ totalDonations?: number; totalDonors?: number; totalTransactions?: number } | null>(null)
  const [proposalCount, setProposalCount] = useState(0)

  useEffect(() => {
    fetch('/api/platform/stats')
      .then(r => r.json())
      .then(d => { if (d.stats) setStats(d.stats) })
      .catch(() => {})
    fetch('/api/governance/proposals')
      .then(r => r.json())
      .then(d => { if (d.proposals) setProposalCount(d.proposals.length) })
      .catch(() => {})
  }, [])

  if (!stats) return null

  return (
    <div className="flex items-center justify-center gap-10 md:gap-16 py-6 px-6 animate-fade-up">
      {[
        { value: (stats.totalDonations || 0).toFixed(2), label: 'SOL Donated', suffix: '' },
        { value: stats.totalDonors || 0, label: 'Donors', suffix: '' },
        { value: proposalCount, label: 'Proposals', suffix: '' },
      ].map((s) => (
        <div key={s.label} className="text-center">
          <p className="text-2xl md:text-3xl font-bold counter tracking-tight text-[#1d1d1f]">{s.value}{s.suffix}</p>
          <p className="text-[10px] text-[#86868b] uppercase tracking-[0.12em] font-medium mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

/* ===== DESKTOP RIGHT SIDEBAR STATS ===== */
function DesktopStatsWidget() {
  const [stats, setStats] = useState<{ totalDonations?: number; totalDonors?: number } | null>(null)
  const [proposalCount, setProposalCount] = useState(0)

  useEffect(() => {
    fetch('/api/platform/stats')
      .then(r => r.json())
      .then(d => { if (d.stats) setStats(d.stats) })
      .catch(() => {})
    fetch('/api/governance/proposals')
      .then(r => r.json())
      .then(d => { if (d.proposals) setProposalCount(d.proposals.length) })
      .catch(() => {})
  }, [])

  if (!stats) return null

  return (
    <div className="card p-4">
      <h3 className="font-bold text-[15px] mb-3">Platform Stats</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#86868b]">SOL Donated</span>
          <span className="text-[15px] font-bold counter">{(stats.totalDonations || 0).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#86868b]">Total Donors</span>
          <span className="text-[15px] font-bold counter">{stats.totalDonors || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#86868b]">Proposals</span>
          <span className="text-[15px] font-bold counter">{proposalCount}</span>
        </div>
      </div>
    </div>
  )
}

/* ===== GUEST PROFILE VIEW ===== */
function GuestProfileView() {
  return (
    <div className="max-w-lg mx-auto pt-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-[-0.02em] mb-1">Profile</h2>
        <p className="text-[#86868b] text-sm">Your impact, permanently on-chain.</p>
      </div>
      <div className="card p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aeaeb2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <p className="text-[#1d1d1f] font-semibold mb-1.5">Connect to see your profile</p>
        <p className="text-[#86868b] text-sm mb-6 max-w-xs mx-auto">Your donations, certificates, social graph, and impact score — all in one place.</p>
        <WalletButton />
      </div>
    </div>
  )
}

/* ===== LANDING PAGE ===== */
function LandingPage({ onGuestMode }: { onGuestMode: () => void }) {
  return (
    <div className="min-h-[100dvh] page-bg overflow-hidden">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[9px] bg-[#1d1d1f] flex items-center justify-center">
              <span className="text-white text-[11px] font-black tracking-tight">U</span>
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.02em]">Umanity</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onGuestMode}
              className="text-[13px] text-[#86868b] hover:text-[#1d1d1f] font-medium transition-colors"
            >
              Explore
            </button>
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero — Apple keynote style */}
        <div className="max-w-5xl mx-auto px-6 pt-32 md:pt-44 pb-16">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-black/[0.04] text-[11px] font-medium text-[#86868b] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Solana Graveyard Hackathon
            </div>

            <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold tracking-[-0.04em] leading-[0.92] mb-6 text-[#1d1d1f]">
              Crypto charity
              <br />
              <span className="text-[#d4d4d4] line-through decoration-[#e5e5e5] decoration-2">is dead.</span>
              <br />
              <span className="text-emerald-600">Resurrected.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#86868b] max-w-lg leading-relaxed mb-10 font-light">
              Social proof replaces trust-me-bro. Community escrow replaces rug pulls. Giving becomes the content.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <WalletButton />
              <button
                onClick={onGuestMode}
                className="btn-secondary px-6 py-3 text-[14px] rounded-xl"
              >
                Explore as Guest
              </button>
            </div>
            <div className="flex items-center gap-5 text-[11px] text-[#aeaeb2] mt-6">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Non-custodial
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                Instant
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Transparent
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* What Died */}
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-6">
          <p className="text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.15em] mb-6 text-center">What died</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-stagger">
            {[
              { dead: 'GoFundMe Clones', why: 'No transparency. Off-chain. No community.' },
              { dead: 'Charity Tokens', why: 'Rug pulls. No accountability. Speculation disguised as giving.' },
              { dead: 'Donation Pages', why: 'Zero follow-up. No social proof. Forgotten forever.' },
            ].map((item) => (
              <div key={item.dead} className="card p-5 opacity-80">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#d4d4d4] text-sm">&#x1FAA6;</span>
                  <h3 className="text-[13px] font-semibold text-[#aeaeb2] line-through">{item.dead}</h3>
                </div>
                <p className="text-[12px] text-[#86868b] leading-relaxed">{item.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center py-4">
          <div className="flex flex-col items-center gap-1 text-emerald-500">
            <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Resurrected */}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-stagger">
            {[
              {
                num: '01',
                title: 'Social-First Feed',
                subtitle: 'Social Proof > Donation Pages',
                desc: 'Your feed shows what your network is giving. Donations become stories. Built on Tapestry Protocol.',
                tag: 'Tapestry',
                highlight: true,
              },
              {
                num: '02',
                title: 'DAO Governance',
                subtitle: 'Community Escrow > Trust Me Bro',
                desc: 'On-chain escrow vaults. Community votes control fund releases. Real stakes.',
                tag: 'Anchor',
                highlight: false,
              },
              {
                num: '03',
                title: 'Impact Certificates',
                subtitle: 'On-Chain Proof > Email Receipts',
                desc: 'Tiered certificates from Bronze to Diamond. Permanent, verifiable on Solana.',
                tag: 'Impact',
                highlight: false,
              },
            ].map((f) => (
              <div key={f.num} className="card-interactive p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-[#aeaeb2]">{f.num}</span>
                  <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
                    f.highlight
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-[#86868b] bg-black/[0.03]'
                  }`}>{f.tag}</span>
                </div>
                <h3 className="text-base font-semibold mb-0.5 text-[#1d1d1f]">{f.title}</h3>
                <p className="text-[11px] font-medium text-emerald-600 mb-2">{f.subtitle}</p>
                <p className="text-[12px] text-[#86868b] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-[#aeaeb2] mt-5">Social layer powered by Tapestry Protocol</p>
        </div>

        {/* Footer */}
        <div className="border-t border-black/[0.04] py-10 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-[12px] text-[#aeaeb2]">
              <span>Solana</span>
              <span>Tapestry</span>
              <span>Anchor</span>
              <span>Supabase</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onGuestMode} className="btn-secondary px-4 py-2 text-[13px] rounded-xl">
                Explore
              </button>
              <WalletButton />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ===== 4-STEP ONBOARDING ===== */
function OnboardingScreen({ onComplete, referrer }: { onComplete: () => void; referrer?: string }) {
  const { publicKey, disconnect } = useWallet()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [animating, setAnimating] = useState(false)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const [suggestedProfiles, setSuggestedProfiles] = useState<{ username: string; bio?: string }[]>([])
  const [selectedFollows, setSelectedFollows] = useState<Set<string>>(new Set())
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const TOTAL_STEPS = 4

  const goTo = (next: number) => {
    if (animating) return
    setDirection(next > step ? 'forward' : 'back')
    setAnimating(true)

    if (contentRef.current) {
      contentRef.current.style.opacity = '0'
      contentRef.current.style.transform = next > step ? 'translateX(-16px)' : 'translateX(16px)'
    }

    setTimeout(() => {
      setStep(next)
      if (contentRef.current) {
        contentRef.current.style.transform = direction === 'forward' ? 'translateX(16px)' : 'translateX(-16px)'
      }
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.style.opacity = '1'
          contentRef.current.style.transform = 'translateX(0)'
        }
        setTimeout(() => setAnimating(false), 300)
      })
    }, 180)
  }

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true)
    try {
      const res = await fetch(`/api/social/suggested?username=${username}`)
      const data = await res.json()
      setSuggestedProfiles(data.profiles?.slice(0, 8) || [])
    } catch {
      // none
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const toggleFollow = (u: string) => {
    setSelectedFollows(prev => {
      const next = new Set(prev)
      if (next.has(u)) next.delete(u)
      else next.add(u)
      return next
    })
  }

  const selectAll = () => {
    if (selectedFollows.size === suggestedProfiles.length) {
      setSelectedFollows(new Set())
    } else {
      setSelectedFollows(new Set(suggestedProfiles.map(p => p.username)))
    }
  }

  const register = async () => {
    if (!publicKey || !username || !displayName) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: publicKey.toBase58(),
          username: username.toLowerCase(),
          displayName,
          bio,
          referredBy: referrer,
        }),
      })
      const data = await response.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      if (data.success) {
        for (const followee of selectedFollows) {
          try {
            await fetch('/api/social/follow', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ follower: username.toLowerCase(), followee }),
            })
          } catch {
            // Non-blocking
          }
        }
        setShowSuccess(true)
        setTimeout(() => onComplete(), 2000)
      }
    } catch {
      setError('Registration failed. Please try again.')
      setLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-[100dvh] page-bg flex items-center justify-center px-6">
        <div className="text-center onboarding-success">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 onboarding-success-icon">
            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#1d1d1f] mb-2">You&apos;re in</h2>
          <p className="text-[#86868b] text-sm mb-3">Welcome to Umanity, @{username}</p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-[#aeaeb2]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              +50 points
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Tapestry profile
            </span>
            {selectedFollows.size > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {selectedFollows.size} following
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  const walletPreview = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : ''

  return (
    <div className="min-h-[100dvh] page-bg flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[9px] bg-[#1d1d1f] flex items-center justify-center">
            <span className="text-white text-[11px] font-black tracking-tight">U</span>
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.02em]">Umanity</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="text-[12px] text-[#aeaeb2] hover:text-[#86868b] transition-colors"
        >
          Disconnect
        </button>
      </header>

      {/* Progress */}
      <div className="px-6 max-w-lg mx-auto w-full">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, s) => (
            <div key={s} className="h-[2px] flex-1 rounded-full overflow-hidden bg-black/[0.05]">
              <div
                className="h-full rounded-full bg-[#1d1d1f] transition-all duration-600 ease-out"
                style={{ width: s <= step ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div
          ref={contentRef}
          className="max-w-lg w-full"
          style={{ transition: 'opacity 0.2s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >

          {/* STEP 0: WELCOME */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-white border border-black/[0.04] flex items-center justify-center mx-auto mb-8 onboarding-float shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-[#1d1d1f] flex items-center justify-center">
                  <span className="text-white text-base font-black">U</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#1d1d1f] mb-2">Welcome to Umanity</h2>
              <p className="text-[#86868b] leading-relaxed mb-2 max-w-sm mx-auto text-sm">
                The social impact network on Solana.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 text-[10px] text-[#86868b] mt-1 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Connected: {walletPreview}
              </div>
              {referrer && (
                <div className="block mx-auto w-fit mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[10px] text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Referred by @{referrer}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5 mb-8 animate-stagger">
                {[
                  { icon: '◎', label: 'Social Feed' },
                  { icon: '⬡', label: 'DAO Voting' },
                  { icon: '◆', label: 'Impact Certs' },
                ].map((f) => (
                  <div key={f.label} className="card p-3.5 text-center">
                    <div className="text-lg mb-1">{f.icon}</div>
                    <div className="text-[11px] font-medium text-[#1d1d1f]">{f.label}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => goTo(1)} className="btn-primary w-full py-3.5 text-[15px] rounded-xl">
                Get started
              </button>
              <p className="text-[10px] text-[#aeaeb2] mt-3">Takes less than 30 seconds</p>
            </div>
          )}

          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div>
              <p className="text-[10px] text-[#aeaeb2] uppercase tracking-[0.12em] mb-2 font-medium">Step 1 of 3</p>
              <h2 className="text-xl font-bold tracking-[-0.02em] text-[#1d1d1f] mb-1">Choose your identity</h2>
              <p className="text-[#86868b] text-sm mb-6">How others will find you on Umanity.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-medium text-[#86868b] uppercase tracking-[0.08em] mb-1.5 block">Username</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aeaeb2] text-sm">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="satoshi"
                      maxLength={30}
                      autoFocus
                      className="input !pl-8"
                    />
                  </div>
                  {username.length > 0 && username.length < 3 && (
                    <p className="text-[10px] text-amber-500 mt-1">At least 3 characters</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[#86868b] uppercase tracking-[0.08em] mb-1.5 block">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Satoshi Nakamoto"
                    maxLength={50}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 mt-8">
                <button onClick={() => goTo(0)} className="btn-secondary flex-1 py-3 rounded-xl">Back</button>
                <button
                  onClick={() => { goTo(2); fetchSuggestions() }}
                  disabled={!username || !displayName || username.length < 3}
                  className="btn-primary flex-[2] py-3 rounded-xl"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: FOLLOW SUGGESTIONS */}
          {step === 2 && (
            <div>
              <p className="text-[10px] text-[#aeaeb2] uppercase tracking-[0.12em] mb-2 font-medium">Step 2 of 3</p>
              <h2 className="text-xl font-bold tracking-[-0.02em] text-[#1d1d1f] mb-1">Follow impact makers</h2>
              <p className="text-[#86868b] text-sm mb-5">See their donations in your feed.</p>

              {loadingSuggestions ? (
                <div className="space-y-2.5">
                  {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
                </div>
              ) : suggestedProfiles.length > 0 ? (
                <>
                  <div className="flex justify-end mb-2">
                    <button onClick={selectAll} className="text-[11px] text-[#86868b] hover:text-[#1d1d1f] transition-colors font-medium">
                      {selectedFollows.size === suggestedProfiles.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    {suggestedProfiles.map((profile) => (
                      <button
                        key={profile.username}
                        onClick={() => toggleFollow(profile.username)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border ${
                          selectedFollows.has(profile.username)
                            ? 'border-[#1d1d1f] bg-black/[0.02]'
                            : 'border-transparent bg-white hover:bg-black/[0.02]'
                        }`}
                      >
                        <GradientAvatar username={profile.username} size="md" />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[13px] font-medium">@{profile.username}</p>
                          {profile.bio && <p className="text-[11px] text-[#86868b] truncate">{profile.bio}</p>}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                          selectedFollows.has(profile.username)
                            ? 'border-[#1d1d1f] bg-[#1d1d1f]'
                            : 'border-[#d4d4d4]'
                        }`}>
                          {selectedFollows.has(profile.username) && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="card p-6 text-center mb-3">
                  <p className="text-[#86868b] text-sm">No suggestions yet — discover people in Explore!</p>
                </div>
              )}

              <div className="flex gap-2.5 mt-6">
                <button onClick={() => goTo(1)} className="btn-secondary flex-1 py-3 rounded-xl">Back</button>
                <button onClick={() => goTo(3)} className="btn-primary flex-[2] py-3 rounded-xl">
                  {selectedFollows.size > 0 ? `Follow ${selectedFollows.size} & Continue` : 'Skip'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BIO + PREVIEW */}
          {step === 3 && (
            <div>
              <p className="text-[10px] text-[#aeaeb2] uppercase tracking-[0.12em] mb-2 font-medium">Step 3 of 3</p>
              <h2 className="text-xl font-bold tracking-[-0.02em] text-[#1d1d1f] mb-1">Almost there</h2>
              <p className="text-[#86868b] text-sm mb-6">Review your profile.</p>

              <div className="card p-4 mb-5">
                <div className="flex items-center gap-3.5">
                  <GradientAvatar username={username} size="xl" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1d1d1f]">{displayName}</p>
                    <p className="text-[12px] text-[#86868b]">@{username}</p>
                  </div>
                  <div className="flex items-center gap-3 text-center">
                    <div>
                      <div className="text-sm font-bold counter">0</div>
                      <div className="text-[8px] text-[#aeaeb2] uppercase tracking-wider">Followers</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold counter text-emerald-600">50</div>
                      <div className="text-[8px] text-[#aeaeb2] uppercase tracking-wider">Points</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium text-[#86868b] uppercase tracking-[0.08em] mb-1.5 block">Bio (optional)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="What drives you to make an impact?"
                  maxLength={280}
                  rows={3}
                  autoFocus
                  className="input resize-none"
                />
                <p className="text-[9px] text-[#aeaeb2] mt-1 text-right">{bio.length}/280</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 mt-3">
                  <p className="text-red-600 text-xs">{error}</p>
                </div>
              )}

              <div className="flex gap-2.5 mt-6">
                <button onClick={() => goTo(2)} disabled={loading} className="btn-secondary flex-1 py-3 rounded-xl">Back</button>
                <button onClick={register} disabled={loading} className="btn-primary flex-[2] py-3 rounded-xl">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create profile'
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 text-[10px] text-[#aeaeb2] mt-4">
                <span>+50 points</span>
                <span className="w-0.5 h-0.5 rounded-full bg-[#d4d4d4]" />
                <span>Tapestry profile</span>
                <span className="w-0.5 h-0.5 rounded-full bg-[#d4d4d4]" />
                <span>Impact eligible</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ===== DONATE TAB ===== */
function DonateView({ guestMode }: { guestMode?: boolean }) {
  return (
    <div className="space-y-8">
      <section className="pt-2">
        <h2 className="text-2xl font-bold tracking-[-0.02em] mb-1">
          Make an impact
        </h2>
        <p className="text-[#86868b] text-sm">
          On-chain charity. Every donation earns points and mints proof-of-impact.
        </p>
      </section>

      {guestMode && (
        <div className="card p-4 flex items-center gap-3 border-l-2 border-l-amber-400">
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <span className="text-xs">&#x1FAA6;</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Guest mode</p>
            <p className="text-[11px] text-[#86868b]">Connect wallet to donate.</p>
          </div>
          <WalletButton />
        </div>
      )}

      <OneTapDonation />
      <DonationPools />
      <TippingSystem />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Leaderboard />
        <ActivityFeed />
      </section>
    </div>
  )
}
