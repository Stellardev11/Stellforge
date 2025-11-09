import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { pointsApi, PointBalance, ReferralInfo, Task } from '../api/points';
import { Copy, Check, Gift, Coins, Users, Trophy, ExternalLink, TrendingUp } from 'lucide-react';
import starLogo from '../assets/star-logo.png';

export default function PointsDashboard() {
  const { connected, address } = useWallet();
  const walletAddress = address || '';
  const [balance, setBalance] = useState<PointBalance | null>(null);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (connected && walletAddress) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [connected, walletAddress]);

  const loadData = async () => {
    if (!walletAddress) return;
    
    try {
      setLoading(true);
      const [balanceData, refData, tasksData, completedData] = await Promise.all([
        pointsApi.getBalance(walletAddress),
        pointsApi.getReferralInfo(walletAddress),
        pointsApi.getTasks(),
        pointsApi.getCompletedTasks(walletAddress),
      ]);
      
      setBalance(balanceData);
      setReferralInfo(refData);
      setTasks(tasksData);
      setCompletedTaskIds(new Set(completedData.map((c: any) => c.taskId)));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimBonus = async () => {
    if (!walletAddress || balance?.initialBonusReceived) return;
    
    try {
      setClaiming(true);
      const result = await pointsApi.claimBonus(walletAddress);
      
      if (result.awarded) {
        alert(`🎉 You received ${result.points} STAR points as an early user bonus!`);
        loadData();
      } else {
        alert('Sorry, the early user bonus is no longer available.');
      }
    } catch (error: any) {
      console.error('Error claiming bonus:', error);
      alert(error.response?.data?.error || 'Failed to claim bonus');
    } finally {
      setClaiming(false);
    }
  };

  const copyReferralLink = () => {
    if (!referralInfo) return;
    navigator.clipboard.writeText(referralInfo.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completeTask = async (taskId: string) => {
    if (!walletAddress) return;
    
    try {
      const result = await pointsApi.completeTask(walletAddress, taskId);
      alert(`✅ ${result.message}`);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to complete task');
    }
  };

  if (!connected || !walletAddress) {
    return (
      <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-gradient-to-br from-[#1E2329] to-[#0B0E11] border border-[#2B3139] rounded-2xl p-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#FCD535] to-[#F7931A] rounded-full flex items-center justify-center">
            <Coins className="w-12 h-12 text-black" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Wallet Connection Required</h2>
          <p className="text-gray-400">
            Please connect your Stellar wallet using the wallet button in the top navigation to view your STAR points dashboard, referral stats, and more.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const totalPoints = parseFloat(balance?.starPoints || '0');

  return (
    <div className="min-h-screen bg-[#0B0E11] pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <img src={starLogo} alt="STAR" className="w-10 h-10" />
            STAR Points Dashboard
          </h1>
          <p className="text-gray-400">Earn STAR points and participate in the SLF token launch</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-[#FCD535]/10 via-purple-500/10 to-blue-500/10 border border-[#FCD535]/30 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FCD535]/20 to-transparent rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FCD535] to-[#F7931A] rounded-xl flex items-center justify-center">
                    <img src={starLogo} alt="STAR" className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Balance</p>
                    <p className="text-xs text-[#FCD535]">STAR Points</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold bg-gradient-to-r from-[#FCD535] to-[#F7931A] bg-clip-text text-transparent">
                    {totalPoints.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">≈ ${(totalPoints * 0.1).toFixed(2)} USD</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0B0E11]/50 backdrop-blur-sm rounded-xl p-4 border border-[#FCD535]/10">
                  <Coins className="w-5 h-5 text-[#FCD535] mb-2" />
                  <div className="text-xs text-gray-400 mb-1">Minting</div>
                  <div className="text-lg font-bold text-white">
                    {parseFloat(balance?.pointsEarnedFromMinting || '0').toFixed(2)}
                  </div>
                </div>
                
                <div className="bg-[#0B0E11]/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/10">
                  <Users className="w-5 h-5 text-purple-400 mb-2" />
                  <div className="text-xs text-gray-400 mb-1">Referrals</div>
                  <div className="text-lg font-bold text-white">
                    {parseFloat(balance?.pointsEarnedFromReferrals || '0').toFixed(2)}
                  </div>
                </div>
                
                <div className="bg-[#0B0E11]/50 backdrop-blur-sm rounded-xl p-4 border border-blue-500/10">
                  <Trophy className="w-5 h-5 text-blue-400 mb-2" />
                  <div className="text-xs text-gray-400 mb-1">Tasks</div>
                  <div className="text-lg font-bold text-white">
                    {parseFloat(balance?.pointsEarnedFromTasks || '0').toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Your Share
              </h3>
              <p className="text-xs text-gray-400 mb-4">Of total SLF allocation</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">
                {totalPoints > 0 ? ((totalPoints / 100000) * 100).toFixed(4) : '0.0000'}%
              </div>
              <p className="text-sm text-purple-300">
                ≈ {((totalPoints / 100000) * 60000000).toLocaleString(undefined, {maximumFractionDigits: 0})} SLF tokens
              </p>
              <div className="mt-4 h-2 bg-[#0B0E11]/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalPoints / 100000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {!balance?.initialBonusReceived && (
          <div className="bg-gradient-to-r from-[#FCD535]/10 to-[#F7931A]/10 border border-[#FCD535]/30 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <Gift className="w-8 h-8 text-[#FCD535] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Early User Bonus Available!</h3>
                <p className="text-gray-300 mb-4">
                  Claim your <span className="text-[#FCD535] font-bold">10 free STAR points</span> as an early user!
                  Limited to first 20,000 users.
                </p>
                <button
                  onClick={claimBonus}
                  disabled={claiming}
                  className="bg-[#FCD535] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#F7931A] transition-colors disabled:opacity-50"
                >
                  {claiming ? 'Claiming...' : 'Claim 10 STAR Points'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#FCD535]" />
              Referral Program
            </h2>
            <p className="text-gray-400 mb-4">
              Invite friends and earn <span className="text-[#FCD535] font-semibold">5 STAR points</span> for each successful referral!
            </p>
            
            <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-4 mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Your Referral Link</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={referralInfo?.referralUrl || ''}
                  readOnly
                  className="flex-1 bg-[#1E2329] text-white px-4 py-2 rounded-lg border border-[#2B3139] text-sm overflow-x-auto"
                />
                <button
                  onClick={copyReferralLink}
                  className="bg-[#FCD535] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#F7931A] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">{referralInfo?.successfulReferrals || 0}</div>
                <div className="text-sm text-gray-400">Successful Referrals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {((referralInfo?.successfulReferrals || 0) * 5).toFixed(0)}
                </div>
                <div className="text-sm text-gray-400">Points Earned</div>
              </div>
            </div>
          </div>

          <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#FCD535]" />
              Earn More Points
            </h2>
            
            <div className="space-y-3">
              {tasks.map(task => {
                const isCompleted = completedTaskIds.has(task.id);
                return (
                  <div
                    key={task.id}
                    className={`bg-[#0B0E11] border ${isCompleted ? 'border-green-500/30' : 'border-[#2B3139]'} rounded-lg p-4`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold">{task.title}</h3>
                      <span className="text-[#FCD535] font-bold text-sm">+{task.starReward}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                    
                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-green-500 text-sm">
                        <Check className="w-4 h-4" />
                        Completed
                      </div>
                    ) : (
                      <button
                        onClick={() => completeTask(task.id)}
                        className="text-[#FCD535] hover:text-[#F7931A] text-sm font-semibold flex items-center gap-1 transition-colors"
                      >
                        Complete Task
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-2">About STAR Points</h3>
          <p className="text-gray-300">
            STAR points will be converted to SLF tokens at TGE (Token Generation Event). 
            60% of the 100M SLF token supply (60M tokens) is allocated to STAR holders.
            Your share is proportional to your STAR points.
          </p>
        </div>
      </div>
    </div>
  );
}
