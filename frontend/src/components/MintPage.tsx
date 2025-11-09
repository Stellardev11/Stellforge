import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { pointsApi } from '../api/points';
import { ArrowRight, Star, Lock, Users, Zap, Database } from 'lucide-react';
import starToken3D from '../assets/star-token-3d.png';

export default function MintPage() {
  const { connected, address } = useWallet();
  const walletAddress = address || '';
  const [xlmAmount, setXlmAmount] = useState('');
  const [showMintForm, setShowMintForm] = useState(false);
  const [minting, setMinting] = useState(false);

  const handleMintClick = () => {
    if (!connected) {
      alert('Please connect your wallet using the button in the top navigation to mint STAR points.');
      return;
    }
    setShowMintForm(true);
  };

  const handleMint = async () => {
    if (!connected || !walletAddress) {
      alert('Please connect your wallet using the button in the top navigation.');
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
      setShowMintForm(false);
    } catch (error: any) {
      console.error('Mint error:', error);
      alert(error.response?.data?.error || 'Failed to mint points. Please try again.');
    } finally {
      setMinting(false);
    }
  };

  const starAmount = xlmAmount ? (parseFloat(xlmAmount) * 10).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-[#0B0E11] pb-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8 flex justify-center">
            <img src={starToken3D} alt="STAR Token" className="w-48 h-48" />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="w-12 h-12 text-[#FCD535]" />
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              STAR Points
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Fair Token Launch Platform on Stellar Blockchain
          </p>
        </div>

        {/* Mint Section */}
        {!showMintForm ? (
          <div className="max-w-md mx-auto mb-16">
            <button
              onClick={handleMintClick}
              className="w-full bg-[#FCD535] text-black py-5 rounded-xl font-bold text-lg hover:bg-[#E5C430] transition-all flex items-center justify-center gap-3"
            >
              <Zap className="w-6 h-6" />
              Mint STAR Points
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto mb-16 bg-[#1A1D23] border border-[#2B3139] rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Mint STAR Points</h2>
            
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Enter XLM Amount</label>
              <input
                type="number"
                value={xlmAmount}
                onChange={(e) => setXlmAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0B0E11] text-white text-2xl font-bold px-4 py-4 rounded-lg border border-[#2B3139] focus:border-[#FCD535] outline-none"
                min="0"
                step="0.1"
              />
            </div>

            {xlmAmount && parseFloat(xlmAmount) > 0 && (
              <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-400 mb-1">You will receive</div>
                <div className="text-3xl font-bold text-[#FCD535]">{starAmount} STAR</div>
              </div>
            )}

            <button
              onClick={handleMint}
              disabled={minting || !xlmAmount || parseFloat(xlmAmount) < 1}
              className="w-full bg-[#FCD535] text-black py-4 rounded-lg font-bold hover:bg-[#E5C430] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {minting ? 'Minting...' : 'Confirm Mint'}
            </button>

            <button
              onClick={() => setShowMintForm(false)}
              className="w-full mt-3 text-gray-400 hover:text-white py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {/* STAR Points Use Case */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">What Are STAR Points?</h2>
          
          <div className="max-w-3xl mx-auto bg-[#1A1D23] border border-[#2B3139] rounded-xl p-8 mb-6">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              STAR points are non-transferable points that represent your allocation in the upcoming SLF token launch. 
              By converting XLM to STAR points at a fixed rate of 10 STAR per 1 XLM, you secure your share of the 
              60% of total SLF supply reserved for STAR holders.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              At the Token Generation Event (TGE), your STAR points will be redeemable for SLF tokens proportionally 
              based on your percentage of the total STAR points supply. The more STAR points you hold, the larger 
              your SLF allocation at launch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-[#1A1D23] border border-[#2B3139] rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-[#FCD535]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-[#FCD535]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Fair Distribution</h3>
              <p className="text-gray-400 text-sm">60% of SLF tokens reserved for STAR holders ensures fair launch</p>
            </div>

            <div className="bg-[#1A1D23] border border-[#2B3139] rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-[#FCD535]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-[#FCD535]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Fixed Rate</h3>
              <p className="text-gray-400 text-sm">1 XLM = 10 STAR conversion rate locked for all participants</p>
            </div>

            <div className="bg-[#1A1D23] border border-[#2B3139] rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-[#FCD535]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-[#FCD535]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Community First</h3>
              <p className="text-gray-400 text-sm">Majority allocation to community participants, not VCs or insiders</p>
            </div>
          </div>
        </div>

        {/* Wallet Connection Info */}
        {!connected && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-[#1A1D23] border border-[#2B3139] rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
              <p className="text-gray-400">Connect your Stellar wallet using the wallet button in the top navigation to mint STAR points and secure your SLF allocation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
