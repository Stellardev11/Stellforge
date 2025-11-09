import { useState, useMemo } from 'react'
import { ArrowLeft, Share2 } from 'lucide-react'
import { XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useTokenMarket } from '../context/TokenMarketContext'

interface TradingTerminalProps {
  tokenId: string
  onBack: () => void
}

export default function TradingTerminal({ tokenId, onBack }: TradingTerminalProps) {
  const { tokens } = useTokenMarket()
  const token = tokens.find(t => t.id === tokenId)
  const [timeframe, setTimeframe] = useState<'1m' | '5D' | '1M'>('1m')
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')

  const chartData = useMemo(() => {
    const basePrice = token?.price || 0.0001
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
  }, [token])

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <p>Token not found</p>
      </div>
    )
  }

  const athPrice = token.price * 1.15

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Token Info */}
        <div className="px-4 pb-3">
          <div className="flex items-start gap-3 mb-3">
            <img src={token.image} alt={token.name} className="w-14 h-14 rounded-xl" />
            <div className="flex-1">
              <h1 className="text-lg font-bold">{token.name}</h1>
              <p className="text-sm text-gray-400">{token.symbol} <span className="text-gray-600">•</span> {token.creator.slice(0, 8)}...{token.creator.slice(-4)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{token.createdAt}</p>
            </div>
          </div>

          {/* Market Cap */}
          <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Market Cap</span>
              <span className="text-xs text-gray-400">ATH ${(athPrice * token.holders).toFixed(2)}K</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold">${(token.marketCap / 1000).toFixed(2)}K</span>
              <span className={`text-sm font-medium ${token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                +${(token.marketCap * 0.15 / 1000).toFixed(1)}K (+{token.change24h.toFixed(2)}%) 24hr
              </span>
            </div>
            {/* Progress Bar */}
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#F7931A] to-[#FCD535] rounded-full transition-all"
                style={{ width: `${token.launchProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 flex gap-4 text-sm border-b border-white/10">
          <button className="pb-2 border-b-2 border-[#FCD535] font-medium">Trade Display</button>
          <button className="pb-2 text-gray-400 hover:text-white transition-colors">Price/MCap</button>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 py-4">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">{token.symbol}/XLM Market Cap (USD) • Pump</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">${(token.marketCap / 1000).toFixed(2)}K</span>
                <span className="text-sm text-red-400">-{(Math.random() * 5).toFixed(2)}% ({(Math.random() * 10).toFixed(2)}%)</span>
              </div>
              <span className="text-xs text-gray-500">Volume ${(token.volume24h / 1000).toFixed(1)}K</span>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-64 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F7931A" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F7931A" stopOpacity={0} />
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
                  stroke="#F7931A"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Timeframe Selector */}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Vol 24h</p>
            <p className="text-base font-semibold">${(token.volume24h / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Price</p>
            <p className="text-base font-semibold">${token.price.toFixed(8)}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">5m</p>
            <p className="text-base font-semibold text-red-400">-30.47%</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">1h</p>
            <p className="text-base font-semibold text-[#FCD535]">+{token.change24h.toFixed(2)}%</p>
          </div>
        </div>

        {/* Launch Curve Progress */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10 mt-4">
          <h3 className="text-sm font-semibold mb-3">Launch Curve Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Progress to DEX</span>
              <span className="font-medium">{token.launchProgress}%</span>
            </div>
            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#F7931A] to-[#FCD535] rounded-full"
                style={{ width: `${token.launchProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              When market cap reaches $100K, liquidity will be automatically deposited to DEX
            </p>
          </div>
        </div>

        {/* Trading Panel */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10 mt-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTradeType('buy')}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                tradeType === 'buy'
                  ? 'bg-[#FCD535] text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setTradeType('sell')}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                tradeType === 'sell'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Sell
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Amount (XLM)</label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#FCD535]/50 focus:ring-1 focus:ring-[#FCD535]/50"
              />
            </div>

            <div className="flex gap-2">
              {['0.1', '0.5', '1', '5'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTradeAmount(amount)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-all"
                >
                  {amount} XLM
                </button>
              ))}
            </div>

            <button className="w-full py-4 bg-[#FCD535] hover:bg-[#F7931A] text-black font-bold rounded-lg text-base transition-all active:scale-98">
              Log in to trade
            </button>

            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Position</span>
                <span className="text-white font-medium">0.00 HIM</span>
              </div>
              <div className="flex justify-between">
                <span>Profit/Loss</span>
                <span className="text-white font-medium">$0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
