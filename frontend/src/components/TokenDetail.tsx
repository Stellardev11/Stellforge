import { useState, useMemo } from 'react'
import { ArrowLeft, Share2, TrendingUp, Users, Activity, Flame, Copy, Check } from 'lucide-react'
import { XAxis, YAxis, ResponsiveContainer, Area, AreaChart, Tooltip } from 'recharts'
import { useWallet } from '../context/WalletContext'
import { Project } from '../types/project'
import TradingTerminal from './TradingTerminal'

interface TokenDetailProps {
  project: Project
  onBack?: () => void
}

export default function TokenDetail({ project, onBack }: TokenDetailProps) {
  const { connected } = useWallet()
  const [timeframe, setTimeframe] = useState<'1m' | '5D' | '1M'>('1m')
  const [showTrading, setShowTrading] = useState(false)
  const [copied, setCopied] = useState(false)

  const chartData = useMemo(() => {
    const basePrice = project.metrics.price || 0.0001
    const points = 50
    const data = []
    
    for (let i = 0; i < points; i++) {
      const variation = (Math.random() - 0.3) * basePrice * 0.5
      const price = basePrice + variation + (i * basePrice * 0.02)
      data.push({
        time: i,
        price: price,
        volume: Math.random() * 10000
      })
    }
    
    return data
  }, [project, timeframe])

  const handleCopyAddress = () => {
    const address = project.assetIssuer || project.creatorWalletAddress
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const marketCap = project.metrics.marketCap || 0
  const price = project.metrics.price || 0
  const change24h = project.metrics.change24h || 0
  const volume24h = project.metrics.volume24h || 0
  const holders = project.metrics.holders || 0
  const launchProgress = project.metrics.launchProgress || 0
  const athPrice = price * 1.15

  if (showTrading) {
    return <TradingTerminal tokenId={project.id} onBack={() => setShowTrading(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white pb-24">
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/10">
        <div className="container-custom max-w-7xl px-4 py-3 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button 
              onClick={handleCopyAddress}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <div className="container-custom max-w-7xl px-4 pb-3">
          <div className="flex items-start gap-3 mb-3">
            {project.logoUrl ? (
              <img src={project.logoUrl} alt={project.tokenName} className="w-14 h-14 rounded-xl ring-2 ring-white/10" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-white/10">
                {project.tokenSymbol[0]}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-lg font-bold">{project.tokenName}</h1>
              <p className="text-sm text-gray-400">
                {project.tokenSymbol} <span className="text-gray-600">•</span> {project.creatorWalletAddress.slice(0, 8)}...{project.creatorWalletAddress.slice(-4)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Market Cap</span>
              <span className="text-xs text-gray-400">ATH ${(athPrice * holders).toFixed(2)}K</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold">${(marketCap / 1000).toFixed(2)}K</span>
              <span className={`text-sm font-medium ${change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}% 24hr
              </span>
            </div>
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all"
                style={{ width: `${launchProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="container-custom max-w-7xl px-4 flex gap-4 text-sm border-b border-white/10">
          <button className="pb-2 border-b-2 border-emerald-500 font-medium">Overview</button>
          <button className="pb-2 text-gray-400 hover:text-white transition-colors">Holders</button>
          <button className="pb-2 text-gray-400 hover:text-white transition-colors">Trades</button>
        </div>
      </div>

      <div className="container-custom max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">{project.tokenSymbol}/XLM Market Cap (USD)</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">${(marketCap / 1000).toFixed(2)}K</span>
                    <span className={`text-sm ${change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Volume ${(volume24h / 1000).toFixed(1)}K</span>
                </div>
              </div>

              <div className="h-64 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      stroke="#333" 
                      tick={{ fill: '#666', fontSize: 10 }}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#333" 
                      tick={{ fill: '#666', fontSize: 10 }}
                      tickLine={false}
                      domain={['dataMin', 'dataMax']}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px'
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex gap-2 mt-3">
                {(['1m', '5D', '1M'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      timeframe === tf
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <p className="text-xs text-gray-400">24h Volume</p>
                </div>
                <p className="text-base font-semibold">${(volume24h / 1000).toFixed(1)}K</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-gray-400">Current Price</p>
                </div>
                <p className="text-base font-semibold">${price.toFixed(8)}</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <p className="text-xs text-gray-400">24h Change</p>
                </div>
                <p className={`text-base font-semibold ${change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <p className="text-xs text-gray-400">Holders</p>
                </div>
                <p className="text-base font-semibold">{holders}</p>
              </div>
            </div>

            {launchProgress < 100 && (
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-semibold mb-3">Launch Curve Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Progress to DEX</span>
                    <span className="font-medium">{launchProgress}%</span>
                  </div>
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-500 rounded-full"
                      style={{ width: `${launchProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    When market cap reaches target, liquidity will be automatically deposited to DEX
                  </p>
                </div>
              </div>
            )}

            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold mb-3">Token Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Supply</span>
                  <span className="font-medium">{parseFloat(project.totalSupply).toLocaleString()} {project.tokenSymbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Decimals</span>
                  <span className="font-medium">{project.decimals}</span>
                </div>
                {project.assetCode && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Asset Code</span>
                    <span className="font-medium font-mono">{project.assetCode}</span>
                  </div>
                )}
                {project.assetIssuer && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Issuer</span>
                    <span className="font-medium font-mono text-xs">
                      {project.assetIssuer.slice(0, 8)}...{project.assetIssuer.slice(-4)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {project.description && (
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-semibold mb-3">About</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{project.description}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10 sticky top-24">
              <h3 className="text-sm font-semibold mb-4">Quick Trade</h3>
              
              <button
                onClick={() => setShowTrading(true)}
                className="w-full py-3 bg-gradient-to-r from-[#FCD535] to-[#F7931A] hover:from-[#E5C430] hover:to-[#E8831A] text-black font-bold rounded-lg transition-all mb-3"
              >
                Open Trading Terminal
              </button>

              {!connected && (
                <div className="text-center py-3 text-sm text-gray-400">
                  Connect wallet via top navigation to trade
                </div>
              )}

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Position</span>
                  <span className="font-medium">0.00 {project.tokenSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit/Loss</span>
                  <span className="font-medium">$0.00</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold mb-3">Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Creator</span>
                  <span className="font-medium">{project.allocation.creator}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Airdrop</span>
                  <span className="font-medium">{project.allocation.airdrop}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Liquidity</span>
                  <span className="font-medium">{project.allocation.liquidity}%</span>
                </div>
              </div>
            </div>

            {project.features.vestingEnabled && (
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-4 border border-purple-500/20">
                <h3 className="text-sm font-semibold mb-2 text-purple-400">Vesting Enabled</h3>
                <p className="text-xs text-gray-400">
                  Tokens are vested over {project.features.vestingMonths} months
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
