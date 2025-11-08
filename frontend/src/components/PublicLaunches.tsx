import { useState, useEffect } from 'react'
import { Rocket, TrendingUp, Users, Clock, DollarSign, Target, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface Token {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  volume: number
  holders: number
  launchedAt: string
  marketCap: number
  airdropStatus: 'active' | 'completed' | 'none'
  airdropProgress?: number
}

interface PublicLaunchesProps {
  onViewTrading?: (tokenId: string) => void
  onViewAirdrop?: (tokenId: string) => void
}

export default function PublicLaunches({ onViewTrading, onViewAirdrop }: PublicLaunchesProps) {
  const [tokens, setTokens] = useState<Token[]>([])
  const [filter, setFilter] = useState<'all' | 'trending' | 'new' | 'airdrop'>('all')

  useEffect(() => {
    const mockTokens: Token[] = [
      {
        id: '1',
        symbol: 'MOON',
        name: 'MoonToken',
        price: 0.0042,
        change24h: 125.5,
        volume: 125000,
        holders: 1234,
        launchedAt: '2 hours ago',
        marketCap: 42000,
        airdropStatus: 'active',
        airdropProgress: 65,
      },
      {
        id: '2',
        symbol: 'STAR',
        name: 'StarCoin',
        price: 0.0018,
        change24h: 45.2,
        volume: 89000,
        holders: 892,
        launchedAt: '5 hours ago',
        marketCap: 28000,
        airdropStatus: 'active',
        airdropProgress: 42,
      },
      {
        id: '3',
        symbol: 'NEBULA',
        name: 'NebulaFi',
        price: 0.0095,
        change24h: -12.3,
        volume: 210000,
        holders: 2156,
        launchedAt: '1 day ago',
        marketCap: 78000,
        airdropStatus: 'completed',
      },
      {
        id: '4',
        symbol: 'GALAXY',
        name: 'GalaxyDAO',
        price: 0.0234,
        change24h: 89.7,
        volume: 345000,
        holders: 3421,
        launchedAt: '3 days ago',
        marketCap: 156000,
        airdropStatus: 'none',
      },
    ]
    setTokens(mockTokens)
  }, [])

  const filteredTokens = tokens.filter(token => {
    if (filter === 'trending') return token.change24h > 50
    if (filter === 'new') return token.launchedAt.includes('hours')
    if (filter === 'airdrop') return token.airdropStatus === 'active'
    return true
  })

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-display-md md:text-display-lg text-white mb-4">
            <span className="text-gradient">Public Launches</span>
          </h1>
          <p className="text-xl text-gray-300">
            Discover and trade new tokens on launch curves. Complete airdrops to earn tokens.
          </p>
        </div>

        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-starglow-gradient text-white'
                : 'glass-card text-gray-400 hover:text-white'
            }`}
          >
            All Tokens
          </button>
          <button
            onClick={() => setFilter('trending')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'trending'
                ? 'bg-starglow-gradient text-white'
                : 'glass-card text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Trending
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'new'
                ? 'bg-starglow-gradient text-white'
                : 'glass-card text-gray-400 hover:text-white'
            }`}
          >
            <Rocket className="w-5 h-5 inline mr-2" />
            New Launches
          </button>
          <button
            onClick={() => setFilter('airdrop')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === 'airdrop'
                ? 'bg-starglow-gradient text-white'
                : 'glass-card text-gray-400 hover:text-white'
            }`}
          >
            <Target className="w-5 h-5 inline mr-2" />
            Active Airdrops
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredTokens.map((token, index) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 rounded-xl hover:shadow-glow transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-starglow-gradient flex items-center justify-center text-white font-bold text-lg">
                    {token.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">{token.symbol}</h3>
                      {token.airdropStatus === 'active' && (
                        <span className="px-2 py-1 bg-stellar-bright-blue/20 text-stellar-bright-blue text-xs font-medium rounded-full">
                          Airdrop Live
                        </span>
                      )}
                      {token.marketCap >= 100000 && (
                        <span className="px-2 py-1 bg-lumina-gold/20 text-lumina-gold text-xs font-medium rounded-full">
                          DEX Listed
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400">{token.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${token.price.toFixed(4)}</p>
                  <p
                    className={`text-sm font-medium ${
                      token.change24h > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {token.change24h > 0 ? '+' : ''}
                    {token.change24h.toFixed(1)}% 24h
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Market Cap</span>
                  </div>
                  <p className="text-white font-semibold">
                    ${(token.marketCap / 1000).toFixed(1)}K
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Volume</span>
                  </div>
                  <p className="text-white font-semibold">
                    ${(token.volume / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    <span>Holders</span>
                  </div>
                  <p className="text-white font-semibold">{token.holders}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Launched</span>
                  </div>
                  <p className="text-white font-semibold">{token.launchedAt}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Target className="w-4 h-4" />
                    <span>To DEX</span>
                  </div>
                  <p className="text-white font-semibold">
                    {token.marketCap >= 100000 ? '✓ Listed' : `$${(100 - token.marketCap / 1000).toFixed(0)}K`}
                  </p>
                </div>
              </div>

              {token.airdropStatus === 'active' && token.airdropProgress && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>Airdrop Progress</span>
                    <span>{token.airdropProgress}% Complete</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-stellar-bright-blue to-lumina-gold transition-all duration-500"
                      style={{ width: `${token.airdropProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => onViewTrading?.(token.id)}
                  className="flex-1 bg-gradient-to-r from-stellar-bright-blue to-blue-600 hover:from-stellar-bright-blue/90 hover:to-blue-600/90 text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  Trade
                  <ArrowRight className="w-4 h-4" />
                </button>
                {token.airdropStatus === 'active' && (
                  <button
                    onClick={() => onViewAirdrop?.(token.id)}
                    className="flex-1 glass-card hover:bg-white/10 text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    Join Airdrop
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
