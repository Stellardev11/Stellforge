import { useState, useEffect } from 'react'
import { Copy, Check, Users, TrendingUp, Gift, ExternalLink, Trophy, Sparkles } from 'lucide-react'
import { useWallet } from '../context/WalletContext'

interface EventProgress {
  projectId: string
  projectName: string
  projectSymbol: string
  projectLogo: string
  userEntries: number
  totalEntries: number
  referralCount: number
  referralRank: number
  estimatedTokens: number
  claimableTokens: number
  claimed: boolean
  referralCode: string
  eventStatus: 'active' | 'ended' | 'launched'
  eventEndDate: Date
  daysRemaining: number
}

export default function ProgressPage() {
  const { connected, address } = useWallet()
  const [copiedCode, setCopiedCode] = useState('')
  const [activeProjects, setActiveProjects] = useState<EventProgress[]>([])

  useEffect(() => {
    if (connected && address) {
      fetchUserProgress()
    }
  }, [connected, address])

  const fetchUserProgress = async () => {
    const mockData: EventProgress[] = [
      {
        projectId: '1',
        projectName: 'Moon Token',
        projectSymbol: 'MOON',
        projectLogo: '/stellforge-icon.png',
        userEntries: 15,
        totalEntries: 450,
        referralCount: 5,
        referralRank: 12,
        estimatedTokens: 8500,
        claimableTokens: 0,
        claimed: false,
        referralCode: 'MOON-' + address.slice(0, 6).toUpperCase(),
        eventStatus: 'active',
        eventEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        daysRemaining: 3
      },
      {
        projectId: '2',
        projectName: 'Star Token',
        projectSymbol: 'STAR',
        projectLogo: '/stellforge-icon.png',
        userEntries: 8,
        totalEntries: 200,
        referralCount: 2,
        referralRank: 45,
        estimatedTokens: 0,
        claimableTokens: 12000,
        claimed: false,
        referralCode: 'STAR-' + address.slice(0, 6).toUpperCase(),
        eventStatus: 'ended',
        eventEndDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        daysRemaining: 0
      }
    ]
    
    setActiveProjects(mockData)
  }

  const copyReferralLink = (project: EventProgress) => {
    const referralLink = `${window.location.origin}/airdrop/${project.projectId}?ref=${project.referralCode}`
    navigator.clipboard.writeText(referralLink)
    setCopiedCode(project.referralCode)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const handleClaim = async (projectId: string) => {
    if (!connected) {
      alert('Please connect your wallet using the button in the top navigation.')
      return
    }
    
    console.log('Claiming tokens for project:', projectId)
    alert('Claim functionality coming soon!')
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <Users className="w-24 h-24 text-[#FCD535] mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Your Progress & Rewards</h1>
            <p className="text-xl text-gray-400">Please connect your Stellar wallet using the button in the top navigation to view your airdrop participation and rewards.</p>
          </div>
        </div>
      </div>
    )
  }

  if (activeProjects.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom max-w-6xl">
          <h1 className="text-4xl font-bold text-white mb-8">
            <span className="text-gradient">Your Progress & Rewards</span>
          </h1>
          
          <div className="bg-pro-dark-card p-12 rounded-2xl border border-white/10 text-center">
            <Gift className="w-24 h-24 text-eth-grey mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">No Active Participations</h2>
            <p className="text-eth-grey-medium mb-8">You haven't joined any airdrop events yet</p>
            <a
              href="/airdrops"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FCD535] to-#F7931A hover:from-[#FCD535]/90 hover:to-#F7931A/90 text-black rounded-xl font-bold transition-all hover:scale-105"
            >
              Browse Active Airdrops
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="text-gradient">Your Progress & Rewards</span>
          </h1>
          <p className="text-xl text-eth-grey-medium">Track your airdrop participation and claim rewards</p>
        </div>

        <div className="space-y-6">
          {activeProjects.map((project) => (
            <div key={project.projectId} className="bg-pro-dark-card p-8 rounded-2xl border border-white/10 shadow-xl">
              <div className="flex items-start gap-6 mb-8">
                <img 
                  src={project.projectLogo} 
                  alt={project.projectName}
                  className="w-20 h-20 rounded-xl border-2 border-[#FCD535] shadow-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{project.projectName}</h2>
                    <span className="text-xl text-eth-grey">{project.projectSymbol}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.eventStatus === 'active' 
                        ? 'bg-[#FCD535]/20 text-[#FCD535] border border-[#FCD535]/40'
                        : project.eventStatus === 'ended'
                        ? 'bg-#F7931A/20 text-#F7931A border border-#F7931A/40'
                        : 'bg-[#FCD535]/20 text-[#FCD535] border border-[#FCD535]/40'
                    }`}>
                      {project.eventStatus === 'active' ? `${project.daysRemaining} days left` : 
                       project.eventStatus === 'ended' ? 'Event Ended' : 'Launched'}
                    </span>
                  </div>
                  <p className="text-eth-grey">
                    Event ends: {project.eventEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-pro-dark-lighter p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#FCD535]" />
                    <p className="text-sm text-eth-grey">Your Entries</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{project.userEntries}</p>
                  <p className="text-xs text-eth-grey mt-1">
                    {((project.userEntries / project.totalEntries) * 100).toFixed(2)}% of total
                  </p>
                </div>

                <div className="bg-pro-dark-lighter p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-#F7931A" />
                    <p className="text-sm text-eth-grey">Referrals</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{project.referralCount}</p>
                  <p className="text-xs text-eth-grey mt-1">Users referred</p>
                </div>

                <div className="bg-pro-dark-lighter p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-[#FCD535]" />
                    <p className="text-sm text-eth-grey">Ranking</p>
                  </div>
                  <p className="text-3xl font-bold text-white">#{project.referralRank}</p>
                  <p className="text-xs text-eth-grey mt-1">Referral leaderboard</p>
                </div>

                <div className="bg-pro-dark-lighter p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-#F7931A" />
                    <p className="text-sm text-eth-grey">
                      {project.eventStatus === 'active' ? 'Estimated' : 'Claimable'}
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-[#FCD535]">
                    {project.eventStatus === 'active' 
                      ? project.estimatedTokens.toLocaleString()
                      : project.claimableTokens.toLocaleString()
                    }
                  </p>
                  <p className="text-xs text-eth-grey mt-1">{project.projectSymbol} tokens</p>
                </div>
              </div>

              {project.eventStatus === 'active' && (
                <div className="bg-gradient-to-r from-[#FCD535]/10 to-#F7931A/10 p-6 rounded-xl border border-[#FCD535]/30">
                  <div className="flex items-start gap-4">
                    <TrendingUp className="w-6 h-6 text-[#FCD535] flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-3">Your Referral Link</h3>
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="text"
                          value={`${window.location.origin}/airdrop/${project.projectId}?ref=${project.referralCode}`}
                          readOnly
                          className="flex-1 bg-pro-dark border border-white/10 rounded-lg px-4 py-3 text-white text-sm"
                        />
                        <button
                          onClick={() => copyReferralLink(project)}
                          className="px-6 py-3 bg-[#FCD535] hover:bg-[#FCD535]/90 text-black rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          {copiedCode === project.referralCode ? (
                            <>
                              <Check className="w-5 h-5" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-5 h-5" /> Copy Link
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-eth-grey-medium">
                        Share this link to earn more entries and climb the leaderboard! Each referral increases your token allocation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {project.eventStatus === 'ended' && !project.claimed && project.claimableTokens > 0 && (
                <div className="bg-gradient-to-r from-[#FCD535]/10 to-[#F7931A]/10 p-6 rounded-xl border border-[#FCD535]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Rewards Ready to Claim!</h3>
                      <p className="text-sm text-eth-grey-medium">
                        You've earned {project.claimableTokens.toLocaleString()} {project.projectSymbol} tokens
                      </p>
                    </div>
                    <button
                      onClick={() => handleClaim(project.projectId)}
                      className="px-8 py-4 bg-gradient-to-r from-[#FCD535] to-[#F7931A] hover:from-[#FCD535]/90 hover:to-[#F7931A]/90 text-black rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
                    >
                      Claim Tokens
                    </button>
                  </div>
                </div>
              )}

              {project.claimed && (
                <div className="bg-pro-dark-lighter p-6 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 text-eth-grey">
                    <Check className="w-6 h-6 text-[#FCD535]" />
                    <p className="text-sm">
                      You've claimed your {project.claimableTokens.toLocaleString()} {project.projectSymbol} tokens
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
