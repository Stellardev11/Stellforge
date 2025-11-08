export interface LaunchConfig {
  tokenName: string
  tokenSymbol: string
  totalSupply: number
  decimals: number
  logoFile: File | null
  description: string
  allocation: {
    airdrop: number
    liquidity: number
    creator: number
  }
  initialLiquidityXLM: number
  eventDurationDays: number
  vestingEnabled: boolean
  vestingMonths?: number
}

export interface TokenEvent {
  id: string
  tokenId: string
  startDate: Date
  endDate: Date
  durationDays: number
  status: 'upcoming' | 'active' | 'ended' | 'launched'
  participantCount: number
  totalEntries: number
}

export interface ProjectData {
  id: string
  name: string
  symbol: string
  logo: string
  description: string
  totalSupply: number
  allocation: {
    creator: number
    airdrop: number
    liquidity: number
  }
  liquidityXLM: number
  event: {
    startDate: Date
    endDate: Date
    durationDays: number
    status: 'upcoming' | 'active' | 'ended' | 'launched'
  }
  currentParticipants: number
  totalEntries: number
  vestingEnabled: boolean
  vestingMonths?: number
  createdAt: Date
  creator: string
}

export interface UserParticipation {
  projectId: string
  userId: string
  walletAddress: string
  joinedAt: Date
  entries: number
  referralCount: number
  referralRank: number
  tokensEarned: number
  claimed: boolean
  referredBy?: string
  referralCode: string
}

export interface ReferralData {
  userId: string
  projectId: string
  referralCode: string
  referredUsers: string[]
  bonusEarned: number
}

export interface LaunchCurveData {
  currentPrice: number
  marketCap: number
  supply: number
  holders: number
  volume24h: number
  priceChange24h: number
  progressToLaunch: number
}
