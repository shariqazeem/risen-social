# For Hackathon Judges

## Quick Start (2 minutes, no wallet needed)

1. Visit **[umanity-solana.vercel.app](https://umanity-solana.vercel.app)**
2. Click **"Explore as Guest"**
3. Browse all 5 tabs: Feed, Explore, Donate, Govern, Profile
4. The feed is populated with real social posts from 14 users

## Full Experience (with Phantom wallet)

1. Install [Phantom](https://phantom.app) and switch to **Devnet** (Settings > Developer > Testnet Mode)
2. Get devnet SOL from [faucet.solana.com](https://faucet.solana.com)
3. Connect wallet > Complete 4-step onboarding
4. Donate 0.01 SOL (One-Tap button) > Watch it auto-post to your feed
5. Vote on a governance proposal in the Govern tab
6. Send an Impact Dare to challenge someone to donate

## Technical Highlights

| What | Where | Why It Matters |
|------|-------|----------------|
| On-chain escrow | `programs/risen-donations/src/lib.rs` (611 lines) | 9 Anchor instructions: pools, campaigns, milestones, refunds |
| Tipping program | `programs/risen-tips/src/lib.rs` (245 lines) | 4 instructions: register, tip, update, toggle |
| Tapestry social layer | `lib/tapestry.ts` (28 functions) | Profiles, feed, follows, likes, comments, search, dares, referrals |
| Smart feed algorithm | `app/api/feed/smart/route.ts` | Personalized: network activity + donations + governance + trending |
| Solana Blinks | `app/api/actions/donate/[poolId]/route.ts` | 6 pools, Actions v2.1.3, partial-sign transactions |
| E2E tests | `tests/e2e-deep.ts` | 51 tests: IDL validation, on-chain ops, APIs, Blinks |
| AI advisor | `components/ai/UmanityAgent.tsx` | Claude-powered chatbot with 350+ line knowledge base |

## Deployed Programs (Devnet)

- **Donations**: [`9JBsHFy9rQhjcPiKkFzqxpUV9HZyZ1ZmE4AWXc1Kiys1`](https://solscan.io/account/9JBsHFy9rQhjcPiKkFzqxpUV9HZyZ1ZmE4AWXc1Kiys1?cluster=devnet)
- **Tips**: [`DBzVAJHgiyVWZMdj1Q2vHUfL1wW4nVag3AqJ5FKmxtau`](https://solscan.io/account/DBzVAJHgiyVWZMdj1Q2vHUfL1wW4nVag3AqJ5FKmxtau?cluster=devnet)

## Blinks (test in browser)

```
GET https://umanity-solana.vercel.app/api/actions/donate/palestine-red-crescent
GET https://umanity-solana.vercel.app/api/actions/tip/shariq
```

## Architecture

```
User donates SOL
  -> Anchor program escrows in vault PDA
  -> DonationRecord created on-chain
  -> Supabase syncs: reward points, milestone check
  -> Tapestry auto-posts to social feed
  -> Impact certificate issued
  -> If milestone threshold crossed -> auto-create governance proposal
  -> Community votes (weighted by donation history)
  -> Authority releases approved milestone funds
```

## By the Numbers

- 2 Anchor programs, 13 instructions, 856 lines Rust
- 28 Tapestry social functions
- 42 Next.js API routes
- 6 Solana Blinks (one per charity pool)
- 51 E2E tests
- 6 active charity pools
- 14 seeded users with social graph
