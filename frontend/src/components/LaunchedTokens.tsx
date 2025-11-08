import { Search, Sparkles, TrendingUp, Rocket } from 'lucide-react'
import { useTokenMarket } from '../context/TokenMarketContext'
import { useState } from 'react'

interface LaunchedTokensProps {
  onViewToken: (tokenId: string) => void
}

export default function LaunchedTokens({ onViewToken }: LaunchedTokensProps) {
  const { launchedTokens } = useTokenMarket()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'launching' | 'graduated'>('all')

  const filteredTokens = launchedTokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false
    
    if (filter === 'launching') return token.launchProgress < 100
    if (filter === 'graduated') return token.launchProgress >= 100
    return true
  })

  const launchingTokens = filteredTokens.filter(t => t.launchProgress < 100)
  const graduatedTokens = filteredTokens.filter(t => t.launchProgress >= 100)

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      <div className="px-4 py-4">
        <h1 className="text-2xl font-bold mb-6">Token Launch Markets</h1>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E2329] border border-[#2B3139] rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#FCD535] transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            All Tokens ({filteredTokens.length})
          </button>
          <button
            onClick={() => setFilter('launching')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === 'launching'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            <Rocket className="w-4 h-4 inline mr-1" />
            Launching ({launchingTokens.length})
          </button>
          <button
            onClick={() => setFilter('graduated')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === 'graduated'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Graduated ({graduatedTokens.length})
          </button>
        </div>

        {/* Launching Tokens Grid */}
        {(filter === 'all' || filter === 'launching') && launchingTokens.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-[#FCD535]" size={20} />
              <h2 className="text-lg font-bold">Currently Launching</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {launchingTokens.map((token) => (
                <button
                  key={token.id}
                  onClick={() => onViewToken(token.id)}
                  className="bg-[#1E2329] hover:bg-[#2B3139] border border-[#2B3139] hover:border-[#FCD535]/50 rounded-xl p-4 transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={token.image} 
                        alt={token.name} 
                        className="w-12 h-12 rounded-full border-2 border-[#2B3139] group-hover:border-[#FCD535]/30" 
                      />
                      <div>
                        <h3 className="font-bold text-base text-white">{token.symbol}</h3>
                        <p className="text-xs text-gray-400">{token.name}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-bold px-2 py-1 rounded ${
                      token.change24h >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Progress to DEX</span>
                      <span className="text-[#FCD535] font-bold">{token.launchProgress}%</span>
                    </div>
                    <div className="w-full bg-[#0B0E11] rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#F7931A] to-[#FCD535] h-2 rounded-full"
                        style={{ width: `${token.launchProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-400 mb-0.5">Market Cap</div>
                      <div className="font-bold text-white">${(token.marketCap / 1000).toFixed(1)}K</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-0.5">Volume</div>
                      <div className="font-bold text-white">${(token.volume24h / 1000).toFixed(1)}K</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-0.5">Holders</div>
                      <div className="font-bold text-white">{token.holders}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Graduated Tokens List */}
        {(filter === 'all' || filter === 'graduated') && graduatedTokens.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-green-400" size={20} />
              <h2 className="text-lg font-bold">Graduated to DEX</h2>
            </div>

            <div className="space-y-2">
              {graduatedTokens.map((token, index) => (
                <button
                  key={token.id}
                  onClick={() => onViewToken(token.id)}
                  className="w-full bg-[#1E2329] hover:bg-[#2B3139] border border-[#2B3139] hover:border-[#FCD535]/30 rounded-lg p-3 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500 text-sm font-medium w-6 text-center">
                      {index + 1}
                    </div>

                    <img 
                      src={token.image} 
                      alt={token.name} 
                      className="w-9 h-9 rounded-full border border-[#2B3139]" 
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-white truncate">{token.name}</h3>
                        <span className="text-gray-500 text-xs">{token.symbol}</span>
                      </div>
                    </div>

                    <div className="hidden sm:block text-right min-w-[80px]">
                      <p className="text-sm text-white font-medium">
                        ${(token.marketCap / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-gray-500">Market Cap</p>
                    </div>

                    <div className="hidden md:block text-right min-w-[80px]">
                      <p className="text-sm text-white font-medium">
                        ${(token.volume24h / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-gray-500">Volume</p>
                    </div>

                    <div className="text-right min-w-[65px]">
                      <p className={`text-sm font-bold ${
                        token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                      </p>
                    </div>

                    <div className="hidden lg:block text-right min-w-[50px]">
                      <p className="text-xs text-gray-400">{token.holders}</p>
                      <p className="text-xs text-gray-600">Holders</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredTokens.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No tokens found</p>
          </div>
        )}
      </div>
    </div>
  )
}
