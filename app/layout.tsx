import type { Metadata } from 'next'
import './globals.css'
import { WalletProvider } from '@/components/wallet/WalletProvider'

export const metadata: Metadata = {
  title: 'Umanity — Social Impact Network on Solana',
  description: 'Donate transparently, govern collectively, prove impact on-chain. The social charity platform resurrecting crypto giving with Solana escrow, DAO governance, and Tapestry social proof.',
  keywords: ['solana', 'charity', 'donations', 'social impact', 'dao', 'governance', 'tapestry', 'web3', 'on-chain', 'escrow', 'nft'],
  authors: [{ name: 'Umanity' }],
  metadataBase: new URL('https://umanity-solana.vercel.app'),
  openGraph: {
    title: 'Umanity — Social Impact Network on Solana',
    description: 'Transparent donations via on-chain escrow, community governance over real funds, and a social feed powered by Tapestry Protocol. Crypto charity, resurrected.',
    siteName: 'Umanity',
    type: 'website',
    url: 'https://umanity-solana.vercel.app',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Umanity Logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'Umanity — Social Impact Network on Solana',
    description: 'Transparent donations, DAO governance, social proof — all on-chain. Crypto charity, resurrected.',
    creator: '@umanity_xyz',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="text-gray-900 overflow-x-hidden">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
