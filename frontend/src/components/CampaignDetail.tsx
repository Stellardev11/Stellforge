import { useState } from 'react'
import { Share2, Trophy, Users, Clock, CheckCircle2, Twitter, MessageCircle, Send, Globe, Copy, Check, Coins, X } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useWallet } from '../context/WalletContext'

export default function CampaignDetail({ campaignId = '1' }: { campaignId?: string }) {
  const { connected, connectWallet } = useWallet()
  
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set())
  const [hasJoined, setHasJoined] = useState(false)
  const [hasClaimed, setHasClaimed] = useState(false)
  const [participantCount, setParticipantCount] = useState(42)
  const [referralCode, setReferralCode] = useState('')
  const [referralLink, setReferralLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const campaign = {
    id: campaignId,
    name: 'MOON Token',
    symbol: 'MOON',
    logo: '/stellforge-icon.png',
    creator: 'GABC...XYZ',
    totalSupply: '1,000,000',
    totalAirdrop: '500,000',
    claimed: '125,000',
    maxParticipants: 100,
    joinFee: 1,
    endDate: new Date(Date.now() + 86400000 * 7),
    socialLinks: {
      twitter: 'https://twitter.com/moontoken',
      discord: 'https://discord.gg/moontoken',
      telegram: 'https://t.me/moontoken',
      website: 'https://moontoken.io'
    },
    allocation: {
      creator: 30,
      airdrop: 50,
      referral: 20
    },
    baseTasks: [
      { id: 1, title: 'Follow on Twitter', type: 'follow_twitter', reward: '100', url: 'https://twitter.com/moontoken' },
      { id: 2, title: 'Join Discord', type: 'join_discord', reward: '100', url: 'https://discord.gg/moontoken' },
      { id: 3, title: 'Join Telegram', type: 'join_telegram', reward: '100', url: 'https://t.me/moontoken' },
      { id: 4, title: 'Refer Friends', type: 'refer_friend', reward: '50', minInvites: 3 },
    ]
  }

  const tasks = campaign.baseTasks.map(task => ({
    ...task,
    completed: completedTasks.has(task.id)
  }))

  const allTasksCompleted = completedTasks.size === campaign.baseTasks.length
  const participationFull = participantCount >= campaign.maxParticipants
  const canClaimTokens = allTasksCompleted && participationFull && hasJoined && !hasClaimed

  const remainingTokens = parseInt(campaign.totalAirdrop.replace(/,/g, '')) - parseInt(campaign.claimed.replace(/,/g, ''))
  const perParticipantAllocation = Math.floor(parseInt(campaign.totalAirdrop.replace(/,/g, '')) / campaign.maxParticipants)

  const pieData = [
    { name: 'Creator', value: campaign.allocation.creator, color: '#FFD700' },
    { name: 'Airdrop Pool', value: campaign.allocation.airdrop, color: '#00D9FF' },
    { name: 'Referral Bonus', value: campaign.allocation.referral, color: '#9D4EDD' },
  ]

  const generateUniqueReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleJoinClick = () => {
    if (!connected) {
      connectWallet()
      return
    }
    setShowJoinModal(true)
  }

  const confirmJoin = () => {
    setHasJoined(true)
    setParticipantCount(prev => prev + 1)
    
    const newCode = generateUniqueReferralCode()
    setReferralCode(newCode)
    
    setShowJoinModal(false)
    setSuccessMessage('🎉 Successfully joined! You can now complete tasks.')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleClaim = () => {
    if (!connected) {
      connectWallet()
      return
    }
    if (!canClaimTokens) return
    
    setHasClaimed(true)
    setSuccessMessage(`🎉 Successfully claimed ${perParticipantAllocation.toLocaleString()} ${campaign.symbol} tokens!`)
    setTimeout(() => setSuccessMessage(''), 5000)
  }

  const handleTaskComplete = (taskId: number) => {
    if (!hasJoined) return
    
    setCompletedTasks(prev => {
      const newSet = new Set(prev)
      newSet.add(taskId)
      return newSet
    })
    
    const task = campaign.baseTasks.find(t => t.id === taskId)
    if (task) {
      setSuccessMessage(`✓ Task completed! +${task.reward} ${campaign.symbol}`)
      setTimeout(() => setSuccessMessage(''), 2000)
    }
  }

  const generateReferralLink = () => {
    if (!referralCode) {
      const newCode = generateUniqueReferralCode()
      setReferralCode(newCode)
      const link = `https://stellforge.app/campaign/${campaign.id}?ref=${newCode}`
      setReferralLink(link)
      navigator.clipboard.writeText(link)
    } else {
      const link = `https://stellforge.app/campaign/${campaign.id}?ref=${referralCode}`
      setReferralLink(link)
      navigator.clipboard.writeText(link)
    }
    
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTaskIcon = (type: string) => {
    switch(type) {
      case 'follow_twitter': return <Twitter className="w-5 h-5" />
      case 'join_discord': return <MessageCircle className="w-5 h-5" />
      case 'join_telegram': return <Send className="w-5 h-5" />
      case 'refer_friend': return <Users className="w-5 h-5" />
      default: return <CheckCircle2 className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen py-12">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl shadow-green-500/50 animate-bounce">
          {successMessage}
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 rounded-2xl border border-white/20 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Join Campaign</h2>
              <button 
                onClick={() => setShowJoinModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="mb-6 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden ring-2 ring-lumina-gold/30">
                <img src={campaign.logo} alt={campaign.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{campaign.name}</h3>
              <p className="text-gray-400">Join this campaign and complete tasks to earn tokens</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Join Fee</span>
                <span className="text-2xl font-bold text-lumina-gold">{campaign.joinFee} XLM</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Potential Earnings</span>
                <span className="text-lg font-bold text-cyan-400">{perParticipantAllocation.toLocaleString()} {campaign.symbol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tasks</span>
                <span className="text-white">{campaign.baseTasks.length} tasks to complete</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmJoin}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all hover:scale-105"
              >
                Confirm & Join
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container-custom max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 rounded-xl border border-white/10 shadow-2xl">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-lumina-gold/30 shadow-lg">
                  <img src={campaign.logo} alt={campaign.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-white">{campaign.name}</h1>
                    {hasJoined && (
                      <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-sm rounded-lg border border-green-500/30 font-semibold">
                        ✓ Joined
                      </span>
                    )}
                  </div>
                  <p className="text-xl text-lumina-gold font-semibold mb-3">${campaign.symbol}</p>
                  <div className="flex items-center gap-3">
                    {campaign.socialLinks.twitter && (
                      <a href={campaign.socialLinks.twitter} target="_blank" rel="noopener noreferrer" 
                         className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-110 group">
                        <Twitter className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                      </a>
                    )}
                    {campaign.socialLinks.discord && (
                      <a href={campaign.socialLinks.discord} target="_blank" rel="noopener noreferrer"
                         className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-110 group">
                        <MessageCircle className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                      </a>
                    )}
                    {campaign.socialLinks.telegram && (
                      <a href={campaign.socialLinks.telegram} target="_blank" rel="noopener noreferrer"
                         className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-110 group">
                        <Send className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                      </a>
                    )}
                    {campaign.socialLinks.website && (
                      <a href={campaign.socialLinks.website} target="_blank" rel="noopener noreferrer"
                         className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-110 group">
                        <Globe className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Total Supply</div>
                  <div className="text-xl font-bold text-white">{campaign.totalSupply}</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-xl p-4 border border-cyan-500/20">
                  <div className="text-sm text-gray-400 mb-1">Remaining Tokens</div>
                  <div className="text-xl font-bold text-cyan-400">{remainingTokens.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-lumina-gold/10 to-lumina-gold/5 rounded-xl p-4 border border-lumina-gold/20">
                  <div className="text-sm text-gray-400 mb-1">Per Participant</div>
                  <div className="text-xl font-bold text-lumina-gold">{perParticipantAllocation.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 mb-6 border border-white/10">
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

              <div className="bg-white/5 rounded-xl p-5 mb-6 border border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-300 font-medium">Participation Progress</span>
                  <span className="text-lumina-gold font-bold">{participantCount} / {campaign.maxParticipants}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden shadow-inner">
                  <div 
                    className="bg-starglow-gradient h-4 rounded-full transition-all duration-500 shadow-lg"
                    style={{width: `${(participantCount / campaign.maxParticipants) * 100}%`}} 
                  />
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  {Math.round((participantCount / campaign.maxParticipants) * 100)}% filled
                </div>
              </div>

              {!hasJoined && connected && (
                <button 
                  onClick={handleJoinClick}
                  className="w-full py-4 mb-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all hover:scale-[1.02] relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Coins className="w-5 h-5" />
                    Join with {campaign.joinFee} XLM
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-lumina-gold" />
                  Complete Tasks to Earn Tokens
                </h3>
                {tasks.map(task => (
                  <div key={task.id} className={`p-5 rounded-xl border transition-all ${
                    task.completed 
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 border-green-500/40 shadow-lg shadow-green-500/20' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          task.completed ? 'bg-green-500/20' : 'bg-white/10'
                        }`}>
                          {task.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          ) : (
                            <div className="text-gray-400">{getTaskIcon(task.type)}</div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-lg">{task.title}</h4>
                          <p className="text-sm text-gray-400">
                            <span className="text-lumina-gold font-bold">+{task.reward} {campaign.symbol}</span>
                            {task.minInvites && ` • Refer ${task.minInvites} friends`}
                          </p>
                        </div>
                      </div>
                      {!task.completed && hasJoined && (
                        <button 
                          onClick={() => handleTaskComplete(task.id)}
                          className="px-6 py-2.5 bg-starglow-gradient text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105"
                        >
                          Complete
                        </button>
                      )}
                      {!hasJoined && !task.completed && (
                        <div className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg text-sm">
                          Join to unlock
                        </div>
                      )}
                      {task.completed && (
                        <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-semibold border border-green-500/30">
                          Completed ✓
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl border border-purple-500/20 shadow-lg shadow-purple-500/10">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-400" />
                Referral Program
              </h3>
              <p className="text-gray-300 mb-4">Share your referral link and earn 50 {campaign.symbol} tokens for each friend who joins!</p>
              {referralCode && (
                <div className="mb-3 p-3 bg-lumina-gold/10 border border-lumina-gold/30 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Your Referral Code</div>
                  <div className="text-lg font-bold text-lumina-gold font-mono">{referralCode}</div>
                </div>
              )}
              <button 
                onClick={generateReferralLink} 
                disabled={!connected}
                className={`flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 transition-all mb-3 w-full justify-center font-semibold ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Generate & Copy Referral Link'}
              </button>
              {referralLink && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-300 break-all font-mono">{referralLink}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl border border-white/10 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Campaign Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">Creator</span>
                  <span className="text-white font-mono">{campaign.creator}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">Total Airdrop</span>
                  <span className="text-lumina-gold font-bold">{campaign.totalAirdrop}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">Join Fee</span>
                  <span className="text-white font-bold">{campaign.joinFee} XLM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Ends
                  </span>
                  <span className="text-white">{campaign.endDate.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
              <h3 className="text-xl font-bold text-white mb-4">Your Progress</h3>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {tasks.filter(t => t.completed).reduce((sum, t) => sum + parseInt(t.reward), 0)}
                </div>
                <div className="text-gray-400">Tokens Earned</div>
              </div>
              <div className="text-center text-sm text-gray-400 mb-6 bg-white/5 py-2 rounded-lg">
                {completedTasks.size} / {tasks.length} tasks completed
              </div>
              
              {!connected ? (
                <button 
                  onClick={connectWallet} 
                  className="w-full px-4 py-3 bg-starglow-gradient text-white rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-[1.02]"
                >
                  Connect Wallet to Join
                </button>
              ) : hasClaimed ? (
                <div className="w-full px-4 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-lg font-semibold border border-green-500/30 text-center">
                  ✓ Tokens Claimed!
                </div>
              ) : canClaimTokens ? (
                <button 
                  onClick={handleClaim} 
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-green-500/50 transition-all hover:scale-[1.02] animate-pulse"
                >
                  🎉 Claim Your Tokens Now!
                </button>
              ) : (
                <div className="space-y-2">
                  {!hasJoined && (
                    <div className="text-sm text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-lg p-3">
                      ⚠️ Join the campaign first
                    </div>
                  )}
                  {!allTasksCompleted && hasJoined && (
                    <div className="text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
                      ⚠️ Complete all tasks to claim
                    </div>
                  )}
                  {!participationFull && (
                    <div className="text-sm text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-lg p-3">
                      ℹ️ Waiting for 100% participation
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="glass-card p-6 rounded-xl border border-lumina-gold/20 shadow-lg shadow-lumina-gold/10">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-lumina-gold" />
                <h3 className="text-xl font-bold text-white">Top Earners</h3>
              </div>
              <div className="space-y-3">
                {[
                  { rank: 1, user: 'GABC...XY7Z', claimed: '1,500' },
                  { rank: 2, user: 'GDEF...AB2C', claimed: '1,200' },
                  { rank: 3, user: 'GHIJ...KL5M', claimed: '1,000' },
                ].map(entry => (
                  <div key={entry.rank} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-lumina-gold text-black' : 
                        entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black' :
                        'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                      }`}>
                        #{entry.rank}
                      </div>
                      <span className="text-white font-mono text-sm">{entry.user}</span>
                    </div>
                    <span className="text-lumina-gold font-bold">{entry.claimed}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
