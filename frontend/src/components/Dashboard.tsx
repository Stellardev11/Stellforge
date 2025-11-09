import { Gift, Target, Users, Rocket, ArrowRight, CheckCircle2, TrendingUp, Coins, Trophy, Flame, Wallet, Star, Share2, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { pointsApi, PointBalance } from '../api/points'
import { useWallet } from '../context/WalletContext'
import starLogo from '../assets/star-logo.png'

type DashboardProps = {
  setActiveTab: (tab: 'swap' | 'liquidity' | 'projects' | 'dashboard' | 'mint' | 'leaderboard' | 'docs') => void
}

interface Project {
  id: string
  tokenName: string
  tokenSymbol: string
  description: string
  logoUrl?: string
  totalStarBurned: string
  totalParticipations: number
  airdropPercent: string
  eventEndDate: string
  status: string
}

export default function NewDashboard({ setActiveTab }: DashboardProps) {
  const { connected, connectWallet, address } = useWallet()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [userBalance, setUserBalance] = useState<PointBalance | null>(null)
  const [referralCode, setReferralCode] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (connected && address) {
      fetchProjects()
      fetchUserData()
    }
  }, [connected, address])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await api.getActiveProjects()
      if (response.success && response.data) {
        setProjects(response.data as Project[])
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserData = async () => {
    if (!address) return
    try {
      const balance = await pointsApi.getBalance(address)
      setUserBalance(balance)
      
      const refInfo = await pointsApi.getReferralInfo(address)
      setReferralCode(refInfo.referralCode || '')
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalStarBurned = projects.reduce((sum, p) => sum + parseFloat(p.totalStarBurned || '0'), 0)
  const totalParticipants = projects.reduce((sum, p) => sum + (p.totalParticipations || 0), 0)
  const topProjects = [...projects]
    .sort((a, b) => parseFloat(b.totalStarBurned || '0') - parseFloat(a.totalStarBurned || '0'))
    .slice(0, 6)

  const lifecycle = [
    {
      step: '1',
      title: 'Create Token',
      description: 'Launch your token with name, symbol, supply, and custom branding.',
      icon: Rocket,
      color: 'from-[#FCD535] to-[#F7931A]',
    },
    {
      step: '2',
      title: 'Setup Airdrop',
      description: 'Configure distribution percentages and social tasks for community engagement.',
      icon: Gift,
      color: 'from-[#FCD535] to-[#F7931A]',
    },
    {
      step: '3',
      title: 'Users Participate',
      description: 'Community completes tasks, earns tokens, and becomes eligible for claims.',
      icon: Users,
      color: 'from-[#F7931A] to-[#FCD535]',
    },
    {
      step: '4',
      title: 'Launch Curve Trading',
      description: 'Token trades on launch curve with fair price discovery as demand grows.',
      icon: TrendingUp,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      step: '5',
      title: 'DEX Launch',
      description: 'At $100K market cap, token auto-launches on Stellar DEX for full liquidity.',
      icon: CheckCircle2,
      color: 'from-[#FCD535] to-[#F7931A]',
    },
  ]

  if (!connected) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <div className="glass-card rounded-3xl p-12 text-center border-2 border-[#FCD535]/20">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-8"
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#FCD535] to-[#F7931A] rounded-full flex items-center justify-center shadow-2xl shadow-[#FCD535]/50">
                <Wallet className="w-16 h-16 text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome to <span className="text-gradient">StellForge</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Connect your Stellar wallet to access your personalized dashboard, view your STAR points, referral stats, and participate in token launches.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Star, label: 'View STAR Balance', color: 'from-[#FCD535] to-[#F7931A]' },
                { icon: Share2, label: 'Get Referral Link', color: 'from-[#F7931A] to-[#FCD535]' },
                { icon: Trophy, label: 'Track Progress', color: 'from-[#FCD535] to-[#F7931A]' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-300 font-medium">{feature.label}</p>
                </motion.div>
              ))}
            </div>
            
            <button
              onClick={connectWallet}
              className="group px-12 py-5 bg-gradient-to-r from-[#FCD535] to-[#F7931A] hover:from-[#FCD535]/90 hover:to-[#F7931A]/90 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 shadow-glow inline-flex items-center gap-3"
            >
              <Wallet className="w-7 h-7" />
              Connect Stellar Wallet
              <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-sm text-gray-500 mt-6">
              Supports Freighter, Albedo, LOBSTR, and other Stellar wallets
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="bg-deep-space pb-20">
      <section 
        className="relative py-16 md:py-24 overflow-hidden"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 hero-overlay"></div>
        <div className="absolute inset-0 bg-pattern"></div>
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-4 text-sm font-medium text-[#FCD535]">
                <CheckCircle2 className="w-4 h-4" />
                Wallet Connected
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Welcome Back, <span className="text-gradient">Builder</span>! 👋
              </h1>
              
              <p className="text-lg text-gray-300 mb-6">
                {address.substring(0, 8)}...{address.substring(address.length - 8)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6 border-2 border-[#FCD535]/20 hover:border-[#FCD535]/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FCD535] to-[#F7931A] rounded-xl flex items-center justify-center">
                    <img src={starLogo} alt="STAR" className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Your STAR Balance</div>
                    <div className="text-3xl font-bold text-white">
                      {userBalance ? parseFloat(userBalance.starPoints).toLocaleString() : '0'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-gray-400">From Minting</div>
                    <div className="text-white font-semibold">
                      {userBalance ? parseFloat(userBalance.pointsEarnedFromMinting).toFixed(0) : '0'}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-gray-400">From Referrals</div>
                    <div className="text-white font-semibold">
                      {userBalance ? parseFloat(userBalance.pointsEarnedFromReferrals).toFixed(0) : '0'}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-6 border-2 border-[#F7931A]/20 hover:border-[#F7931A]/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F7931A] to-[#FCD535] rounded-xl flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Your Referral Code</div>
                    <div className="text-xl font-bold text-white font-mono">
                      {referralCode || 'Loading...'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={copyReferralLink}
                  disabled={!referralCode}
                  className="w-full px-4 py-2 bg-gradient-to-r from-[#F7931A] to-[#FCD535] text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Referral Link
                    </>
                  )}
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-2xl p-6 border-2 border-[#FCD535]/20 hover:border-[#FCD535]/40 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FCD535] to-[#F7931A] rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Platform Stats</div>
                    <div className="text-xl font-bold text-white">Active User</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-gray-400">From Platform</div>
                    <div className="text-white font-semibold">
                      {userBalance ? parseFloat(userBalance.pointsEarnedFromPlatform).toFixed(0) : '0'}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-gray-400">From Tasks</div>
                    <div className="text-white font-semibold">
                      {userBalance ? parseFloat(userBalance.pointsEarnedFromTasks).toFixed(0) : '0'}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-deep-space/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { label: 'Live Tokens', value: loading ? '...' : projects.length.toString(), icon: Rocket },
              { label: 'Total STAR Burned', value: loading ? '...' : Math.round(totalStarBurned).toLocaleString(), icon: Flame },
              { label: 'Active Airdrops', value: loading ? '...' : projects.length.toString(), icon: Target },
              { label: 'Total Participants', value: loading ? '...' : totalParticipants.toLocaleString(), icon: Users },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-xl p-6 text-center"
                >
                  <Icon className="w-8 h-8 text-[#FCD535] mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>

          <div className="text-center mb-12">
            <h2 className="text-display-sm md:text-display-md text-white mb-4">
              How <span className="text-gradient">StellForge</span> Works
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Complete token lifecycle from creation to DEX listing in 5 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            {lifecycle.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="glass-card rounded-xl p-6 hover:shadow-glow transition-all relative"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color} rounded-t-xl`}></div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold`}>
                      {item.step}
                    </div>
                    <Icon className="w-6 h-6 text-[#FCD535]" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                </motion.div>
              )
            })}
          </div>

          {topProjects.length > 0 && (
            <div className="mt-16">
              <div className="text-center mb-8">
                <h2 className="text-display-sm md:text-display-md text-white mb-4">
                  🔥 <span className="text-gradient">Trending Projects</span>
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Top projects by STAR burned - Join the action!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-xl p-6 hover:shadow-glow transition-all cursor-pointer"
                    onClick={() => setActiveTab('projects')}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {project.logoUrl ? (
                        <img 
                          src={project.logoUrl} 
                          alt={project.tokenName}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FCD535] to-[#F7931A] flex items-center justify-center text-white font-bold">
                          {project.tokenSymbol?.charAt(0) || 'T'}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{project.tokenName}</h3>
                        <p className="text-sm text-gray-400">{project.tokenSymbol}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">{project.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <p className="text-xs text-gray-400">STAR Burned</p>
                        </div>
                        <p className="text-lg font-bold text-white">
                          {Math.round(parseFloat(project.totalStarBurned || '0')).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-[#F7931A]" />
                          <p className="text-xs text-gray-400">Participants</p>
                        </div>
                        <p className="text-lg font-bold text-white">
                          {project.totalParticipations || 0}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Airdrop</span>
                        <span className="text-white font-semibold">{project.airdropPercent}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => setActiveTab('projects')}
                  className="px-6 py-3 glass-card hover:bg-white/10 text-white rounded-lg font-medium transition-all border border-white/10 inline-flex items-center gap-2"
                >
                  View All Projects
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-16 glass-card rounded-2xl p-8 md:p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Coins className="w-12 h-12 text-[#FCD535]" />
                <h2 className="text-display-sm text-white">
                  Ready to Launch?
                </h2>
              </div>
              <p className="text-lg text-gray-300 mb-8">
                Create your token in minutes with our easy wizard. Set up airdrops, launch curve trading, and watch your community grow.
              </p>
              <button
                onClick={() => setActiveTab('projects')}
                className="group px-10 py-5 bg-gradient-to-r from-[#FCD535] to-[#F7931A] hover:from-[#FCD535]/90 hover:to-[#F7931A]/90 text-white rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-glow inline-flex items-center gap-2"
              >
                <Rocket className="w-6 h-6" />
                Launch Your Token Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
