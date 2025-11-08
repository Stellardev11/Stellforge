import { useState, useMemo } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Coins, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react'
import { useWallet } from '../context/WalletContext'

interface LaunchCurveTradeProps {
  tokenId?: string
}

export default function LaunchCurveTrade({ tokenId = '1' }: LaunchCurveTradeProps) {
  const { connected, connectWallet } = useWallet()
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('0')

  const tokenData: Record<string, {
    id: string
    name: string
    symbol: string
    logo: string
    price: number
    marketCap: number
    supply: number
    holders: number
    volume24h: number
    priceChange24h: number
  }> = {
    '1': {
      id: '1',
      name: 'MOON Token',
      symbol: 'MOON',
      logo: '/stellforge-icon.png',
      price: 0.0042,
      marketCap: 42000,
      supply: 10000000,
      holders: 342,
      volume24h: 12400,
      priceChange24h: 23.5,
    },
    '2': {
      id: '2',
      name: 'StarCoin',
      symbol: 'STAR',
      logo: '/stellforge-icon.png',
      price: 0.0018,
      marketCap: 28000,
      supply: 15000000,
      holders: 892,
      volume24h: 8900,
      priceChange24h: 45.2,
    },
    '3': {
      id: '3',
      name: 'NebulaFi',
      symbol: 'NEBULA',
      logo: '/stellforge-icon.png',
      price: 0.0095,
      marketCap: 78000,
      supply: 8200000,
      holders: 2156,
      volume24h: 21000,
      priceChange24h: -12.3,
    },
    '4': {
      id: '4',
      name: 'GalaxyDAO',
      symbol: 'GALAXY',
      logo: '/stellforge-icon.png',
      price: 0.0234,
      marketCap: 156000,
      supply: 6666666,
      holders: 3421,
      volume24h: 34500,
      priceChange24h: 89.7,
    },
  }

  const token = tokenData[tokenId] || tokenData['1']

  const chartData = useMemo(() => {
    const data = []
    for (let i = 0; i <= 20; i++) {
      const supply = (i / 20) * 15000000
      const price = 0.001 + (supply / 10000000) ** 1.5 * 0.01
      const marketCap = supply * price
      data.push({
        supply: Math.round(supply),
        price: parseFloat(price.toFixed(6)),
        marketCap: Math.round(marketCap),
      })
    }
    return data
  }, [])

  const handleAmountChange = (value: string) => {
    setAmount(value)
    const numAmount = parseFloat(value) || 0
    if (activeTab === 'buy') {
      const cost = numAmount * token.price
      setEstimatedCost(cost.toFixed(4))
    } else {
      const received = numAmount * token.price * 0.97
      setEstimatedCost(received.toFixed(4))
    }
  }

  const handleTrade = () => {
    if (!connected) {
      connectWallet()
      return
    }
    alert(`${activeTab === 'buy' ? 'Buying' : 'Selling'} ${amount} ${token.symbol} - Coming soon!`)
  }

  const progressToLaunch = (token.marketCap / 100000) * 100

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img src={token.logo} alt={token.name} className="w-16 h-16 rounded-full border-2 border-stellar-bright-blue/30" />
            <div>
              <h1 className="text-display-md text-white">
                {token.name} <span className="text-gray-400">({token.symbol})</span>
              </h1>
              <p className="text-gray-400">Launch Curve Trading</p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progress to DEX Launch</span>
              <span className="text-sm font-medium text-white">${token.marketCap.toLocaleString()} / $100,000</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-stellar-bright-blue to-lumina-gold transition-all duration-500"
                style={{ width: `${Math.min(progressToLaunch, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {progressToLaunch >= 100 
                ? '🎉 Ready for DEX launch!' 
                : `${(100 - progressToLaunch).toFixed(1)}% remaining until auto-launch on Stellar DEX`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Price Chart</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3BA3FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3BA3FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis 
                      dataKey="supply" 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                      tickFormatter={(value) => `$${value.toFixed(4)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F1F38',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#9CA3AF' }}
                      itemStyle={{ color: '#3BA3FF' }}
                      formatter={(value: any) => [`$${value.toFixed(6)}`, 'Price']}
                      labelFormatter={(value) => `Supply: ${(value / 1000000).toFixed(2)}M`}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#3BA3FF"
                      strokeWidth={2}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Price</span>
                </div>
                <div className="text-2xl font-bold text-white">${token.price.toFixed(6)}</div>
                <div className={`text-sm flex items-center gap-1 ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.priceChange24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(token.priceChange24h).toFixed(2)}%
                </div>
              </div>

              <div className="glass-card rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Coins className="w-4 h-4" />
                  <span>Market Cap</span>
                </div>
                <div className="text-2xl font-bold text-white">${(token.marketCap / 1000).toFixed(1)}K</div>
                <div className="text-sm text-gray-400">of $100K</div>
              </div>

              <div className="glass-card rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>24h Volume</span>
                </div>
                <div className="text-2xl font-bold text-white">${(token.volume24h / 1000).toFixed(1)}K</div>
                <div className="text-sm text-gray-400">+12.3%</div>
              </div>

              <div className="glass-card rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Coins className="w-4 h-4" />
                  <span>Holders</span>
                </div>
                <div className="text-2xl font-bold text-white">{token.holders}</div>
                <div className="text-sm text-gray-400">+24 today</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('buy')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    activeTab === 'buy'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 inline mr-1" />
                  Buy
                </button>
                <button
                  onClick={() => setActiveTab('sell')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    activeTab === 'sell'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 inline mr-1" />
                  Sell
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount ({token.symbol})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-bright-blue transition-colors"
                  />
                </div>

                <div className="glass-card bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                      {activeTab === 'buy' ? 'You pay' : 'You receive'}
                    </span>
                    <span className="text-lg font-bold text-white">{estimatedCost} XLM</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Price per token</span>
                    <span>${token.price.toFixed(6)}</span>
                  </div>
                  {activeTab === 'sell' && (
                    <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                      <span>Fee (3%)</span>
                      <span>{(parseFloat(amount || '0') * token.price * 0.03).toFixed(4)} XLM</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleTrade}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className={`w-full py-4 rounded-lg font-semibold transition-all ${
                    activeTab === 'buy'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {!connected
                    ? 'Connect Wallet'
                    : activeTab === 'buy'
                    ? `Buy ${token.symbol}`
                    : `Sell ${token.symbol}`}
                </button>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-stellar-bright-blue mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-2">Launch Curve Info</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">
                    This token trades on a launch curve. Price increases as more tokens are purchased, ensuring fair price discovery.
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    When market cap reaches $100K, liquidity is automatically migrated to Stellar DEX for full trading.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
