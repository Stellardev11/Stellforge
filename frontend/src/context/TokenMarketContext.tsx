import { createContext, useContext, useState, ReactNode } from 'react'

interface TokenData {
  id: string
  name: string
  symbol: string
  image: string
  marketCap: number
  price: number
  change24h: number
  volume24h: number
  holders: number
  launchProgress: number
  creator: string
  description: string
  type: 'launched' | 'airdrop'
  createdAt: string
  status?: 'active' | 'upcoming' | 'completed'
  twitter?: string
  discord?: string
}

interface TokenMarketContextType {
  tokens: TokenData[]
  selectedToken: TokenData | null
  setSelectedToken: (token: TokenData | null) => void
  trendingTokens: TokenData[]
  launchedTokens: TokenData[]
  airdropProjects: TokenData[]
}

const TokenMarketContext = createContext<TokenMarketContextType | undefined>(undefined)

const mockTokens: TokenData[] = [
  {
    id: '1',
    name: 'Stellar Pepe',
    symbol: 'SPEPE',
    image: '/stellforge-icon.png',
    marketCap: 327000,
    price: 0.00024,
    change24h: 59.25,
    volume24h: 91800,
    holders: 1820,
    launchProgress: 100,
    creator: 'GABC...XYZ',
    description: 'The first meme coin on Stellar with launch curve',
    type: 'launched',
    createdAt: '6m ago',
    twitter: 'https://twitter.com/stellarpepe',
    discord: 'https://discord.gg/stellarpepe'
  },
  {
    id: '2',
    name: 'Moon Lumens',
    symbol: 'MLUM',
    image: '/stellforge-icon.png',
    marketCap: 287000,
    price: 0.00018,
    change24h: 142.5,
    volume24h: 54190,
    holders: 1612,
    launchProgress: 100,
    creator: 'GDEF...ABC',
    description: 'Community-driven token heading to the moon',
    type: 'launched',
    createdAt: '2h ago',
    twitter: 'https://twitter.com/moonlumens',
    discord: 'https://discord.gg/moonlumens'
  },
  {
    id: '3',
    name: 'Stellar Doge',
    symbol: 'SDOGE',
    image: '/stellforge-icon.png',
    marketCap: 524200,
    price: 0.000062,
    change24h: 391.95,
    volume24h: 7460,
    holders: 2284,
    launchProgress: 100,
    creator: 'GHIJ...DEF',
    description: 'Much wow, very Stellar',
    type: 'launched',
    createdAt: '5m ago',
    twitter: 'https://twitter.com/stellardoge',
    discord: 'https://discord.gg/stellardoge'
  },
  {
    id: '4',
    name: 'Cyber Stellar',
    symbol: 'CYBER',
    image: '/stellforge-icon.png',
    marketCap: 456000,
    price: 0.00032,
    change24h: 78.4,
    volume24h: 82300,
    holders: 1520,
    launchProgress: 100,
    creator: 'GXYZ...ABC',
    description: 'Futuristic DeFi protocol on Stellar blockchain',
    type: 'launched',
    createdAt: '1h ago',
    twitter: 'https://twitter.com/cyberstellar',
    discord: 'https://discord.gg/cyberstellar'
  },
  {
    id: '5',
    name: 'Neon Finance',
    symbol: 'NEON',
    image: '/stellforge-icon.png',
    marketCap: 198000,
    price: 0.00015,
    change24h: 124.8,
    volume24h: 45600,
    holders: 980,
    launchProgress: 100,
    creator: 'GNEON...XYZ',
    description: 'Next-gen yield farming protocol with neon aesthetics',
    type: 'launched',
    createdAt: '3h ago',
    twitter: 'https://twitter.com/neonfinance',
    discord: 'https://discord.gg/neonfinance'
  },
  {
    id: '6',
    name: 'Quantum Lumens',
    symbol: 'QLUM',
    image: '/stellforge-icon.png',
    marketCap: 612000,
    price: 0.00041,
    change24h: 215.6,
    volume24h: 128400,
    holders: 2450,
    launchProgress: 100,
    creator: 'GQNTM...DEF',
    description: 'Revolutionary quantum-resistant crypto token',
    type: 'launched',
    createdAt: '4h ago',
    twitter: 'https://twitter.com/quantumlumens',
    discord: 'https://discord.gg/quantumlumens'
  },
  {
    id: '7',
    name: 'DeFi Airdrop Campaign',
    symbol: 'DEFI',
    image: '/stellforge-icon.png',
    marketCap: 50000,
    price: 0.0001,
    change24h: 0,
    volume24h: 0,
    holders: 0,
    launchProgress: 0,
    creator: 'GKLM...GHI',
    description: 'Complete tasks to earn DEFI tokens',
    type: 'airdrop',
    createdAt: '3m ago',
    status: 'active'
  },
  {
    id: '8',
    name: 'Community Rewards',
    symbol: 'CREW',
    image: '/stellforge-icon.png',
    marketCap: 100000,
    price: 0.0002,
    change24h: 0,
    volume24h: 0,
    holders: 0,
    launchProgress: 0,
    creator: 'GNOP...JKL',
    description: 'Airdrop for early supporters and task completers',
    type: 'airdrop',
    createdAt: '1h ago',
    status: 'active'
  }
]

export function TokenMarketProvider({ children }: { children: ReactNode }) {
  const [tokens] = useState<TokenData[]>(mockTokens)
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null)

  const trendingTokens = tokens.filter(t => t.type === 'launched').slice(0, 10)
  const launchedTokens = tokens.filter(t => t.type === 'launched')
  const airdropProjects = tokens.filter(t => t.type === 'airdrop')

  return (
    <TokenMarketContext.Provider value={{
      tokens,
      selectedToken,
      setSelectedToken,
      trendingTokens,
      launchedTokens,
      airdropProjects
    }}>
      {children}
    </TokenMarketContext.Provider>
  )
}

export function useTokenMarket() {
  const context = useContext(TokenMarketContext)
  if (context === undefined) {
    throw new Error('useTokenMarket must be used within TokenMarketProvider')
  }
  return context
}
