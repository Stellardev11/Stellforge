import { useState, useEffect } from 'react'
import { Search, Flame, Sparkles, TrendingUp, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useTokenMarket } from '../context/TokenMarketContext'

interface ExchangeHomeProps {
  onViewToken: (tokenId: string) => void
  onCreateToken: () => void
}

export default function ExchangeHome({ onViewToken, onCreateToken }: ExchangeHomeProps) {
  const { trendingTokens, launchedTokens } = useTokenMarket()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0)

  // Apply search filter to all tokens
  const filteredTrendingTokens = trendingTokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredLaunchedTokens = launchedTokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const completedTokens = filteredTrendingTokens
    .filter(t => t.launchProgress >= 100)
    .sort((a, b) => {
      const scoreA = (a.volume24h * 0.5) + (a.marketCap * 0.5)
      const scoreB = (b.volume24h * 0.5) + (b.marketCap * 0.5)
      return scoreB - scoreA
    })
    .slice(0, 10)
  
  const newLaunches = filteredLaunchedTokens
    .filter(t => t.launchProgress < 100)
    .slice(0, 8)
  
  const nextTrending = () => {
    if (completedTokens.length === 0) return
    setCurrentTrendingIndex((prev) => (prev + 1) % completedTokens.length)
  }
  
  const prevTrending = () => {
    if (completedTokens.length === 0) return
    setCurrentTrendingIndex((prev) => (prev - 1 + completedTokens.length) % completedTokens.length)
  }
  
  useEffect(() => {
    if (completedTokens.length > 0 && currentTrendingIndex >= completedTokens.length) {
      setCurrentTrendingIndex(0)
    }
  }, [completedTokens.length, currentTrendingIndex])
  
  // Combine all tokens for the "All Tokens" section
  const allFilteredTokens = [...filteredTrendingTokens, ...filteredLaunchedTokens]
    .filter((token, index, self) => 
      // Remove duplicates based on token id
      index === self.findIndex(t => t.id === token.id)
    )
    .sort((a, b) => b.marketCap - a.marketCap) // Sort by market cap descending

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      <div className="px-4 py-4">
        {/* Search Bar with Create Token Button */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E2329] border border-[#2B3139] rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#F7931A] transition-all"
            />
          </div>
          <button
            onClick={onCreateToken}
            className="flex items-center gap-2 px-4 py-3 bg-[#F7931A] hover:bg-[#e6880f] text-white font-semibold rounded-lg text-sm transition-all shadow-lg shadow-[#F7931A]/20 whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Create Token</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {/* Trending Tokens - Professional Carousel */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="text-[#F7931A]" size={22} />
              <h2 className="text-xl font-bold text-white">
                Trending Tokens
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevTrending}
                className="p-2 bg-[#1E2329] hover:bg-[#2B3139] border border-[#2B3139] rounded-lg transition-all"
                disabled={completedTokens.length === 0}
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
              <button
                onClick={nextTrending}
                className="p-2 bg-[#1E2329] hover:bg-[#2B3139] border border-[#2B3139] rounded-lg transition-all"
                disabled={completedTokens.length === 0}
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            </div>
          </div>

          {completedTokens.length > 0 && completedTokens[currentTrendingIndex] && (
            <div className="relative overflow-hidden">
              <button
                onClick={() => onViewToken(completedTokens[currentTrendingIndex].id)}
                className="w-full bg-gradient-to-br from-[#1E2329] to-[#0B0E11] hover:from-[#2B3139] hover:to-[#1E2329] border border-[#2B3139] hover:border-[#F7931A]/50 rounded-2xl p-6 transition-all text-left group shadow-xl"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={completedTokens[currentTrendingIndex].image} 
                    alt={completedTokens[currentTrendingIndex].name} 
                    className="w-20 h-20 rounded-full border-3 border-[#F7931A]/30 group-hover:border-[#F7931A] transition-all shadow-lg" 
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-2xl text-white mb-1">
                      {completedTokens[currentTrendingIndex].symbol}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {completedTokens[currentTrendingIndex].name}
                    </p>
                    <div className={`inline-flex items-center gap-1 text-lg font-bold px-3 py-1.5 rounded-lg ${
                      completedTokens[currentTrendingIndex].change24h >= 0 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {completedTokens[currentTrendingIndex].change24h >= 0 ? '+' : ''}
                      {completedTokens[currentTrendingIndex].change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-[#0B0E11]/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                    <div className="text-lg font-bold text-white">
                      ${(completedTokens[currentTrendingIndex].marketCap / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="bg-[#0B0E11]/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Volume 24h</div>
                    <div className="text-lg font-bold text-white">
                      ${(completedTokens[currentTrendingIndex].volume24h / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="bg-[#0B0E11]/50 rounded-lg p-3 col-span-2 md:col-span-1">
                    <div className="text-xs text-gray-400 mb-1">Holders</div>
                    <div className="text-lg font-bold text-white">
                      {completedTokens[currentTrendingIndex].holders}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-center gap-1.5">
                  {completedTokens.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentTrendingIndex
                          ? 'bg-[#F7931A] w-8'
                          : 'bg-[#2B3139] w-1.5'
                      }`}
                    />
                  ))}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Newly Launched Tokens - Enhanced Live Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-[#FCD535]" size={22} />
            <h2 className="text-xl font-bold text-white">
              Newly Launched Tokens
            </h2>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full animate-pulse">
              LIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {newLaunches.map((token) => (
              <button
                key={token.id}
                onClick={() => onViewToken(token.id)}
                className="bg-gradient-to-br from-[#1E2329] to-[#0B0E11] hover:from-[#2B3139] hover:to-[#1E2329] border border-[#2B3139] hover:border-[#FCD535]/50 rounded-xl p-5 transition-all text-left group shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={token.image} 
                        alt={token.name} 
                        className="w-16 h-16 rounded-full border-2 border-[#FCD535]/30 group-hover:border-[#FCD535] transition-all shadow-lg" 
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#1E2329] flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white mb-0.5">{token.symbol}</h3>
                      <p className="text-sm text-gray-400 mb-1">{token.name}</p>
                      <p className="text-xs text-[#FCD535] font-medium">Trading Now</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold mb-1 ${
                      token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">24h Change</div>
                  </div>
                </div>

                {/* Launch Curve Progress */}
                <div className="mb-4 bg-[#0B0E11]/50 rounded-lg p-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400 font-medium">Launch Curve Progress</span>
                    <span className="text-[#FCD535] font-bold">{token.launchProgress}%</span>
                  </div>
                  <div className="w-full bg-[#2B3139] rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-[#F7931A] via-[#FCD535] to-[#F7931A] h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ 
                        width: `${token.launchProgress}%`,
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s infinite'
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {100 - token.launchProgress}% remaining until completion
                  </p>
                </div>

                {/* Token Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0B0E11]/50 rounded-lg p-2.5">
                    <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                    <div className="text-sm font-bold text-white">
                      ${(token.marketCap / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="bg-[#0B0E11]/50 rounded-lg p-2.5">
                    <div className="text-xs text-gray-400 mb-1">Volume 24h</div>
                    <div className="text-sm font-bold text-white">
                      ${(token.volume24h / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="bg-[#0B0E11]/50 rounded-lg p-2.5">
                    <div className="text-xs text-gray-400 mb-1">Holders</div>
                    <div className="text-sm font-bold text-white">
                      {token.holders}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* All Tokens Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-blue-400" size={22} />
            <h2 className="text-xl font-bold text-white">
              All Tokens
            </h2>
          </div>

          <div className="space-y-2">
            {allFilteredTokens.slice(0, 15).map((token, index) => (
              <button
                key={token.id}
                onClick={() => onViewToken(token.id)}
                className="w-full bg-[#1E2329] hover:bg-[#2B3139] border border-[#2B3139] hover:border-[#F7931A]/30 rounded-lg p-3 transition-all text-left"
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
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* Empty State - Only show if combined filtered tokens are empty */}
        {searchQuery && allFilteredTokens.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No tokens found matching "{searchQuery}"</p>
            <p className="text-gray-600 text-sm mt-2">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  )
}
