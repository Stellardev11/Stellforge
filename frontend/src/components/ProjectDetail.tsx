import { useState } from 'react'
import { Share2, Users, Clock, Twitter, MessageCircle, Globe, Check, Coins, ArrowLeft, TrendingUp, Flame, Droplet, Activity } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts'
import { useWallet } from '../context/WalletContext'
import { Project, ProjectType } from '../types/project'
import TradingTerminal from './TradingTerminal'

interface ProjectDetailProps {
  project: Project
  onBack?: () => void
}

type TabType = 'overview' | 'metrics' | 'participants' | 'activity'

export default function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const { connected } = useWallet()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showTrading, setShowTrading] = useState(false)
  const [copied, setCopied] = useState(false)

  const pieData = [
    { name: 'Creator', value: project.allocation.creator, color: '#FFD700' },
    { name: 'Airdrop', value: project.allocation.airdrop, color: '#00D9FF' },
    { name: 'Liquidity', value: project.allocation.liquidity, color: '#9D4EDD' },
  ]

  const mockChartData = Array.from({ length: 50 }, (_, i) => ({
    time: i,
    value: Math.random() * 1000 + 500,
  }))

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getProjectTypeIcon = (type: ProjectType) => {
    switch (type) {
      case ProjectType.TOKEN_LAUNCH: return <TrendingUp className="w-5 h-5" />
      case ProjectType.AIRDROP: return <Droplet className="w-5 h-5" />
      case ProjectType.STAR_BURN: return <Flame className="w-5 h-5" />
      case ProjectType.LIQUIDITY: return <Activity className="w-5 h-5" />
    }
  }

  const getProjectTypeLabel = (type: ProjectType) => {
    switch (type) {
      case ProjectType.TOKEN_LAUNCH: return 'Token Launch'
      case ProjectType.AIRDROP: return 'Airdrop Campaign'
      case ProjectType.STAR_BURN: return 'Star Burn Event'
      case ProjectType.LIQUIDITY: return 'Liquidity Pool'
    }
  }

  const renderTypeSpecificContent = () => {
    switch (project.projectType) {
      case ProjectType.TOKEN_LAUNCH:
        return renderTokenLaunchContent()
      case ProjectType.AIRDROP:
        return renderAirdropContent()
      case ProjectType.STAR_BURN:
        return renderStarBurnContent()
      case ProjectType.LIQUIDITY:
        return renderLiquidityContent()
    }
  }

  const renderTokenLaunchContent = () => (
    <div className="space-y-6">
      {project.metrics.marketCap && (
        <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Trading Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Market Cap</div>
              <div className="text-xl font-bold text-white">${(project.metrics.marketCap / 1000).toFixed(2)}K</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Price</div>
              <div className="text-xl font-bold text-cyan-400">${project.metrics.price?.toFixed(6) || '0.00'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">24h Change</div>
              <div className={`text-xl font-bold ${(project.metrics.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(project.metrics.change24h || 0) >= 0 ? '+' : ''}{project.metrics.change24h?.toFixed(2) || '0'}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Holders</div>
              <div className="text-xl font-bold text-white">{project.metrics.holders || 0}</div>
            </div>
          </div>

          {project.metrics.launchProgress !== undefined && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Launch Progress</span>
                <span className="text-white font-medium">{project.metrics.launchProgress}%</span>
              </div>
              <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-500 rounded-full transition-all"
                  style={{ width: `${project.metrics.launchProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                When market cap reaches target, liquidity will be deposited to DEX
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setShowTrading(true)}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all hover:scale-[1.02]"
      >
        Open Trading Terminal
      </button>
    </div>
  )

  const renderAirdropContent = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Droplet className="w-5 h-5 text-cyan-400" />
          Airdrop Details
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Airdrop</span>
            <span className="text-lg font-bold text-cyan-400">
              {(parseFloat(project.totalSupply) * project.allocation.airdrop / 100).toLocaleString()} {project.tokenSymbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Distributed</span>
            <span className="text-lg font-bold text-white">
              {parseFloat(project.metrics.totalStarDistributed).toLocaleString()} STAR
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Participants</span>
            <span className="text-lg font-bold text-white">{project.metrics.totalParticipations}</span>
          </div>
        </div>
      </div>

      {connected ? (
        <button className="w-full py-4 bg-gradient-to-r from-[#FCD535] to-[#F7931A] text-black rounded-xl font-bold text-lg shadow-2xl hover:shadow-[#FCD535]/50 transition-all hover:scale-[1.02]">
          Join Airdrop
        </button>
      ) : (
        <div className="text-center py-4 text-gray-400">
          Connect wallet via top navigation to join airdrop
        </div>
      )}
    </div>
  )

  const renderStarBurnContent = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          Burn Statistics
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total STAR Burned</span>
            <span className="text-2xl font-bold text-orange-400">
              {parseFloat(project.metrics.totalStarBurned).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">XLM Contributed</span>
            <span className="text-lg font-bold text-white">
              {parseFloat(project.metrics.totalXlmContributed).toLocaleString()} XLM
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Participants</span>
            <span className="text-lg font-bold text-white">{project.metrics.totalParticipations}</span>
          </div>
        </div>
      </div>

      {connected ? (
        <button className="w-full py-4 bg-gradient-to-r from-[#FCD535] to-[#F7931A] text-black rounded-xl font-bold text-lg shadow-2xl hover:shadow-[#F7931A]/50 transition-all hover:scale-[1.02]">
          Participate in Burn
        </button>
      ) : (
        <div className="text-center py-4 text-gray-400">
          Connect wallet via top navigation to participate
        </div>
      )}
    </div>
  )

  const renderLiquidityContent = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          Pool Information
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Initial Liquidity</span>
            <span className="text-lg font-bold text-white">
              {parseFloat(project.initialLiquidityXLM).toLocaleString()} XLM
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Pool Allocation</span>
            <span className="text-lg font-bold text-purple-400">
              {project.allocation.liquidity}%
            </span>
          </div>
          {project.metrics.volume24h && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">24h Volume</span>
              <span className="text-lg font-bold text-white">
                ${(project.metrics.volume24h / 1000).toFixed(2)}K
              </span>
            </div>
          )}
        </div>
      </div>

      {connected ? (
        <button className="w-full py-4 bg-gradient-to-r from-[#FCD535] to-[#F7931A] text-black rounded-xl font-bold text-lg shadow-2xl hover:shadow-[#FCD535]/50 transition-all hover:scale-[1.02]">
          Add Liquidity
        </button>
      ) : (
        <div className="text-center py-4 text-gray-400">
          Connect wallet via top navigation to add liquidity
        </div>
      )}
    </div>
  )

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-3">Description</h3>
        <p className="text-gray-300 leading-relaxed">{project.description}</p>
      </div>

      <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5 text-lumina-gold" />
          Token Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-center space-y-3">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {renderTypeSpecificContent()}
    </div>
  )

  const renderMetricsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-5 border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Total Supply</div>
          <div className="text-2xl font-bold text-white">{parseFloat(project.totalSupply).toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-xl p-5 border border-cyan-500/20">
          <div className="text-sm text-gray-400 mb-1">Participants</div>
          <div className="text-2xl font-bold text-cyan-400">{project.metrics.totalParticipations}</div>
        </div>
        <div className="bg-gradient-to-br from-lumina-gold/10 to-lumina-gold/5 rounded-xl p-5 border border-lumina-gold/20">
          <div className="text-sm text-gray-400 mb-1">XLM Contributed</div>
          <div className="text-2xl font-bold text-lumina-gold">{parseFloat(project.metrics.totalXlmContributed).toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-5 border border-purple-500/20">
          <div className="text-sm text-gray-400 mb-1">STAR Distributed</div>
          <div className="text-2xl font-bold text-purple-400">{parseFloat(project.metrics.totalStarDistributed).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Activity Chart</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={mockChartData}>
            <defs>
              <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D9FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00D9FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
            <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
            <Area type="monotone" dataKey="value" stroke="#00D9FF" strokeWidth={2} fill="url(#activityGradient)" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderParticipantsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Top Participants</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white">
                  {i + 1}
                </div>
                <div>
                  <div className="text-white font-medium">GABC...XYZ{i}</div>
                  <div className="text-sm text-gray-400">{Math.floor(Math.random() * 1000)} contributions</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lumina-gold font-bold">{(Math.random() * 10000).toFixed(0)} STAR</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderActivityTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
              <div className="flex-1">
                <div className="text-white font-medium">User GABC...XYZ{i} participated</div>
                <div className="text-sm text-gray-400">{Math.floor(Math.random() * 60)} minutes ago</div>
              </div>
              <div className="text-cyan-400 font-bold">+{(Math.random() * 100).toFixed(0)} STAR</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (showTrading && project.projectType === ProjectType.TOKEN_LAUNCH) {
    return <TradingTerminal tokenId={project.id} onBack={() => setShowTrading(false)} />
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-7xl">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 rounded-xl border border-white/10 shadow-2xl">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-lumina-gold/30 shadow-lg">
                  {project.logoUrl ? (
                    <img src={project.logoUrl} alt={project.tokenName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {project.tokenSymbol[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-4xl font-bold text-white">{project.tokenName}</h1>
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${
                      project.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      project.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {project.status.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-white/10 text-white text-sm rounded-lg border border-white/20 flex items-center gap-1">
                      {getProjectTypeIcon(project.projectType)}
                      {getProjectTypeLabel(project.projectType)}
                    </span>
                  </div>
                  <p className="text-xl text-lumina-gold font-semibold mb-3">${project.tokenSymbol}</p>
                  <div className="flex items-center gap-3">
                    {project.twitter && (
                      <a href={project.twitter} target="_blank" rel="noopener noreferrer" 
                         className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-110 group">
                        <Twitter className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                      </a>
                    )}
                    {project.discord && (
                      <a href={project.discord} target="_blank" rel="noopener noreferrer"
                         className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-110 group">
                        <MessageCircle className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                      </a>
                    )}
                    {project.website && (
                      <a href={project.website} target="_blank" rel="noopener noreferrer"
                         className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-110 group">
                        <Globe className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                      </a>
                    )}
                    <button
                      onClick={() => handleCopyAddress(project.creatorWalletAddress)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-110 group ml-auto"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5 text-gray-400 group-hover:text-white" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-b border-white/10 mb-6">
                <div className="flex gap-6">
                  {(['overview', 'metrics', 'participants', 'activity'] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 px-2 font-medium transition-all ${
                        activeTab === tab
                          ? 'text-white border-b-2 border-cyan-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'metrics' && renderMetricsTab()}
              {activeTab === 'participants' && renderParticipantsTab()}
              {activeTab === 'activity' && renderActivityTab()}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl border border-white/10 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Project Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">Creator</span>
                  <span className="text-white font-mono text-xs">
                    {project.creatorWalletAddress.slice(0, 8)}...{project.creatorWalletAddress.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">Total Supply</span>
                  <span className="text-lumina-gold font-bold">{parseFloat(project.totalSupply).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">Decimals</span>
                  <span className="text-white font-bold">{project.decimals}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">Event Duration</span>
                  <span className="text-white">{project.event.durationDays} days</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Start Date
                  </span>
                  <span className="text-white">{new Date(project.event.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    End Date
                  </span>
                  <span className="text-white">{new Date(project.event.endDate).toLocaleDateString()}</span>
                </div>
                {project.features.vestingEnabled && (
                  <div className="flex justify-between items-center py-2 pt-3 border-t border-white/10">
                    <span className="text-gray-400">Vesting Period</span>
                    <span className="text-purple-400 font-bold">{project.features.vestingMonths} months</span>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
              <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">Participants</div>
                  <div className="text-2xl font-bold text-cyan-400">{project.metrics.totalParticipations}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">XLM Contributed</div>
                  <div className="text-2xl font-bold text-lumina-gold">{parseFloat(project.metrics.totalXlmContributed).toLocaleString()}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">STAR Distributed</div>
                  <div className="text-2xl font-bold text-white">{parseFloat(project.metrics.totalStarDistributed).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
