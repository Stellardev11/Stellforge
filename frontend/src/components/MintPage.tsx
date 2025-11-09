import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { pointsApi, MintStats } from '../api/points';
import { Coins, Zap, TrendingUp, Users, Wallet, ArrowRight, Star, Shield, Trophy, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import slfCoin from '../assets/slf-coin.png';
import starLogo from '../assets/star-logo.png';

export default function MintPage() {
  const { connected, connectWallet, address } = useWallet();
  const walletAddress = address || '';
  const [stats, setStats] = useState<MintStats | null>(null);
  const [xlmAmount, setXlmAmount] = useState('');
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await pointsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        totalXlmReceived: '0',
        totalStarMinted: '0',
        totalUsers: 0,
        totalSupply: '100000000',
        pointHoldersAllocationPercent: '60',
        mintingActive: true,
        usersWithInitialBonus: 0,
        totalStarDistributed: '0'
      });
    }
  };

  const handleMint = async () => {
    if (!connected || !walletAddress) {
      connectWallet();
      return;
    }

    if (!xlmAmount) {
      alert('Please enter XLM amount');
      return;
    }

    const amount = parseFloat(xlmAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    if (amount < 1) {
      alert('Minimum mint amount is 1 XLM');
      return;
    }

    setMinting(true);
    try {
      const mockTxHash = `mint_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const result = await pointsApi.mintPoints(walletAddress, amount, mockTxHash);
      
      alert(`✅ Successfully minted ${result.starPoints} STAR points!`);
      setXlmAmount('');
      loadStats();
    } catch (error: any) {
      console.error('Mint error:', error);
      alert(error.response?.data?.error || 'Failed to mint points. Please try again.');
    } finally {
      setMinting(false);
    }
  };

  const starAmount = xlmAmount ? (parseFloat(xlmAmount) * 10).toFixed(1) : '0';
  const slfAllocation = stats ? 
    (parseFloat(stats.totalSupply) * parseFloat(stats.pointHoldersAllocationPercent) / 100).toLocaleString() 
    : '60,000,000';

  return (
    <div className="min-h-screen bg-[#0B0E11] pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="mb-6 flex justify-center">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative"
            >
              <img src={starLogo} alt="STAR Token" className="w-40 h-40 drop-shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl -z-10"></div>
            </motion.div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Mint <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">STAR Points</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Earn <span className="text-[#FCD535] font-bold">10 STAR points</span> per XLM. 
            STAR holders receive <span className="text-purple-400 font-bold">60% of SLF token supply</span> at TGE
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#FCD535]/10 via-[#F7931A]/5 to-transparent border border-[#FCD535]/20 rounded-2xl p-6 hover:border-[#FCD535]/40 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FCD535] to-[#F7931A] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coins className="w-6 h-6 text-black" />
              </div>
              <span className="text-gray-400 text-sm font-medium">Total XLM Received</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {parseFloat(stats?.totalXlmReceived || '0').toLocaleString()}
            </div>
            <div className="text-sm text-[#FCD535] mt-1">XLM</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <img src={starLogo} alt="STAR" className="w-7 h-7" />
              </div>
              <span className="text-gray-400 text-sm font-medium">Total STAR Minted</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {parseFloat(stats?.totalStarMinted || '0').toLocaleString()}
            </div>
            <div className="text-sm text-purple-400 mt-1">STAR Points</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-gray-400 text-sm font-medium">Total Users</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {stats?.totalUsers.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-green-400 mt-1">Participants</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent border border-pink-500/20 rounded-2xl p-6 hover:border-pink-500/40 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-gray-400 text-sm font-medium">Mint Rate</span>
            </div>
            <div className="text-2xl font-bold text-white">10 STAR/XLM</div>
            <div className="text-sm text-pink-400 mt-1">Fixed Rate</div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mint Form - Takes 2 columns */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Mint Input Card */}
            <div className="bg-gradient-to-br from-[#1E2329] to-[#0B0E11] border border-[#2B3139] rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FCD535] to-[#F7931A] rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                Mint STAR Points
              </h2>

              {!connected ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-8 text-center"
                >
                  <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-gray-400 mb-6">
                    Connect your Stellar wallet to start minting STAR points
                  </p>
                  <button
                    onClick={connectWallet}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all inline-flex items-center gap-2"
                  >
                    <Wallet className="w-5 h-5" />
                    Connect Wallet
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Input Section */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                      Enter XLM Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={xlmAmount}
                        onChange={(e) => setXlmAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-[#0B0E11] text-white text-3xl md:text-4xl font-bold px-6 py-6 rounded-xl border-2 border-[#2B3139] focus:border-[#FCD535] outline-none transition-all"
                        min="0"
                        step="0.1"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <Coins className="w-6 h-6 text-[#FCD535]" />
                        <span className="text-xl font-bold text-gray-400">XLM</span>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Display */}
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide">You Will Receive</span>
                      <div className="flex items-center gap-2">
                        <img src={starLogo} alt="STAR" className="w-5 h-5" />
                        <span className="text-sm font-semibold text-purple-400">STAR Points</span>
                      </div>
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                      {starAmount}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      Conversion Rate: <span className="text-white font-semibold">1 XLM = 10 STAR</span>
                    </div>
                  </motion.div>

                  {/* Transaction Details */}
                  <div className="bg-[#0B0E11] border border-[#2B3139] rounded-xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Transaction Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Network</span>
                        <span className="text-white font-semibold">Stellar Mainnet</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Rate</span>
                        <span className="text-[#FCD535] font-bold">1 XLM = 10 STAR</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Min. Amount</span>
                        <span className="text-white font-semibold">1 XLM</span>
                      </div>
                      <div className="h-px bg-[#2B3139] my-2"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Your Wallet</span>
                        <span className="text-white font-mono text-sm">
                          {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mint Button */}
                  <button
                    onClick={handleMint}
                    disabled={minting || !xlmAmount || parseFloat(xlmAmount) < 1}
                    className="w-full bg-gradient-to-r from-[#FCD535] via-[#F7931A] to-[#FCD535] bg-[length:200%_100%] text-black py-6 rounded-xl font-bold text-xl hover:shadow-2xl hover:shadow-[#FCD535]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-right disabled:hover:bg-left flex items-center justify-center gap-3 group"
                  >
                    {minting ? (
                      <>
                        <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                        Minting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        Mint STAR Points
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    By minting, you agree to the terms and tokenomics of the SLF token launch
                  </p>
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-[#1E2329] to-[#0B0E11] border border-[#2B3139] rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Trophy className="w-7 h-7 text-[#FCD535]" />
                How STAR Points Work
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { num: '1', text: 'Mint STAR points by sending XLM (10 STAR per 1 XLM)', icon: Coins },
                  { num: '2', text: 'Earn bonus points from platform activities and referrals', icon: Gift },
                  { num: '3', text: 'STAR holders receive 60% of total SLF supply at TGE', icon: Star },
                  { num: '4', text: 'Your SLF allocation is proportional to your STAR share', icon: TrendingUp },
                ].map((step) => (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: parseInt(step.num) * 0.1 }}
                    className="flex gap-4 bg-[#0B0E11] border border-[#2B3139] rounded-xl p-4 hover:border-[#FCD535]/30 transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#FCD535] to-[#F7931A] text-black rounded-xl flex items-center justify-center font-bold text-lg">
                      {step.num}
                    </div>
                    <div>
                      <step.icon className="w-5 h-5 text-[#FCD535] mb-2" />
                      <span className="text-gray-300 text-sm leading-relaxed">{step.text}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tokenomics Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* SLF Tokenomics */}
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <img src={slfCoin} alt="SLF" className="w-12 h-12 rounded-full" />
                <div>
                  <h3 className="text-2xl font-bold text-white">SLF Tokenomics</h3>
                  <p className="text-sm text-purple-300">Total Supply Distribution</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-500/20 to-transparent border border-purple-500/30 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 font-medium">Total Supply</span>
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">100,000,000 SLF</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#FCD535]" />
                      <span className="text-gray-300 text-sm">STAR Holders</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[#FCD535] font-bold">{slfAllocation} SLF</div>
                      <div className="text-xs text-purple-300">60%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
                    <span className="text-gray-300 text-sm">Listing Reserve</span>
                    <div className="text-right">
                      <div className="text-white font-semibold">15M SLF</div>
                      <div className="text-xs text-purple-300">15%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
                    <span className="text-gray-300 text-sm">Team</span>
                    <div className="text-right">
                      <div className="text-white font-semibold">15M SLF</div>
                      <div className="text-xs text-purple-300">15%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
                    <span className="text-gray-300 text-sm">Launch</span>
                    <div className="text-right">
                      <div className="text-white font-semibold">5M SLF</div>
                      <div className="text-xs text-purple-300">5%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Other</span>
                    <div className="text-right">
                      <div className="text-white font-semibold">5M SLF</div>
                      <div className="text-xs text-purple-300">5%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TGE Info */}
            <div className="bg-gradient-to-br from-[#1E2329] to-[#0B0E11] border border-[#2B3139] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-[#FCD535]" />
                TGE Details
              </h3>
              <div className="space-y-4 text-sm">
                <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-4">
                  <div className="text-gray-400 mb-2">Token Generation Event</div>
                  <div className="text-white font-semibold">STAR points will be redeemable for SLF tokens at TGE</div>
                </div>
                <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-4">
                  <div className="text-gray-400 mb-2">Your Allocation</div>
                  <div className="text-white font-semibold">Proportional to your STAR points share of total supply</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="text-purple-300 mb-2 font-semibold">💎 60% to STAR Holders</div>
                  <div className="text-gray-300 text-xs leading-relaxed">
                    The majority of SLF supply is reserved for STAR point holders, ensuring fair distribution to early supporters
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Why Mint STAR?</h3>
              <div className="space-y-3 text-sm">
                {[
                  'Get 60% of SLF token supply at TGE',
                  'Early access to premium features',
                  'Participate in governance decisions',
                  'Earn rewards from platform growth'
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
