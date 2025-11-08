import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { pointsApi, MintStats } from '../api/points';
import { Coins, Zap, TrendingUp, Users } from 'lucide-react';
import slfCoin from '../assets/slf-coin.png';
import pSlfLogo from '../assets/pslf-logo.png';

export default function MintPage() {
  const wallet = useWallet();
  const walletAddress = wallet?.address || '';
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
    }
  };

  const handleMint = async () => {
    if (!walletAddress || !xlmAmount) {
      alert('Please connect wallet and enter XLM amount');
      return;
    }

    const amount = parseFloat(xlmAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setMinting(true);
    try {
      // TODO: Replace with real Stellar transaction integration
      // This is a mock transaction hash for demo purposes
      const mockTxHash = `mint_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      await pointsApi.mintPoints(walletAddress, amount, mockTxHash);
      
      alert(`✅ Successfully minted 1 pSLF point!`);
      setXlmAmount('');
      loadStats();
    } catch (error: any) {
      console.error('Mint error:', error);
      alert(error.response?.data?.error || 'Failed to mint points. Please try again.');
    } finally {
      setMinting(false);
    }
  };

  const slfAllocation = stats ? 
    (parseFloat(stats.totalSupply) * parseFloat(stats.pointHoldersAllocationPercent) / 100).toLocaleString() 
    : '60,000,000';

  return (
    <div className="min-h-screen bg-[#0B0E11] pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <img src={slfCoin} alt="SLF Coin" className="w-32 h-32 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Mint pSLF Points
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Earn 1 pSLF point per transaction. Points holders receive 60% of SLF token supply at TGE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#FCD535]/20 to-[#F7931A]/20 border border-[#FCD535]/30 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-[#FCD535]" />
              <span className="text-gray-400 text-sm">Total XLM Received</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {parseFloat(stats?.totalXlmReceived || '0').toLocaleString()} XLM
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <img src={pSlfLogo} alt="pSLF" className="w-5 h-5" />
              <span className="text-gray-400 text-sm">Total pSLF Minted</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {parseFloat(stats?.totalPSlfMinted || '0').toLocaleString()}
            </div>
          </div>

          <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-[#FCD535]" />
              <span className="text-gray-400 text-sm">Total Users</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats?.totalUsers.toLocaleString() || '0'}
            </div>
          </div>

          <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-gray-400 text-sm">Mint Rate</span>
            </div>
            <div className="text-xl font-bold text-white">1 pSLF / TX</div>
            <div className="text-xs text-gray-500 mt-1">Per transaction</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#FCD535]" />
              Mint pSLF Points
            </h2>

            <div className="space-y-6">
              {!walletAddress && (
                <div className="bg-[#FCD535]/10 border border-[#FCD535]/30 rounded-lg p-4 mb-4">
                  <p className="text-[#FCD535] text-sm text-center">
                    Connect your wallet to mint pSLF points
                  </p>
                </div>
              )}
              <div className={!walletAddress ? 'opacity-50 pointer-events-none' : ''}>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    XLM Amount
                  </label>
                  <input
                    type="number"
                    value={xlmAmount}
                    onChange={(e) => setXlmAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0B0E11] text-white text-2xl px-6 py-4 rounded-lg border border-[#2B3139] focus:border-[#FCD535] outline-none"
                    min="0"
                    step="0.1"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    You will receive: <span className="text-[#FCD535] font-semibold">1 pSLF</span> per transaction
                  </p>
                </div>

                <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Mint Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rate</span>
                      <span className="text-white font-semibold">1 Transaction = 1 pSLF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network</span>
                      <span className="text-white">Stellar Mainnet</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleMint}
                  disabled={minting || !xlmAmount}
                  className="w-full bg-gradient-to-r from-[#FCD535] to-[#F7931A] text-black py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-[#FCD535]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {minting ? 'Minting...' : 'Mint pSLF Points'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By minting, you agree to the terms and tokenomics of the SLF token launch
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">SLF Tokenomics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
                  <span className="text-gray-300">Total Supply</span>
                  <span className="text-white font-bold">100,000,000 SLF</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
                  <span className="text-gray-300">Points Holders (60%)</span>
                  <span className="text-[#FCD535] font-bold">{slfAllocation} SLF</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
                  <span className="text-gray-300">Listing Reserve (15%)</span>
                  <span className="text-white font-semibold">15,000,000 SLF</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
                  <span className="text-gray-300">Team (15%)</span>
                  <span className="text-white font-semibold">15,000,000 SLF</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
                  <span className="text-gray-300">Launch (5%)</span>
                  <span className="text-white font-semibold">5,000,000 SLF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Other (5%)</span>
                  <span className="text-white font-semibold">5,000,000 SLF</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1E2329] border border-[#2B3139] rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
              <ol className="space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#FCD535] text-black rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span>Mint pSLF points by sending XLM (1 point per transaction)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#FCD535] text-black rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span>Create projects and earn points from user participation</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#FCD535] text-black rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span>At TGE, receive SLF tokens proportional to your pSLF share</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#FCD535] text-black rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span>60% of total supply goes to pSLF holders</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
