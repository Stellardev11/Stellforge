import { useState, useEffect } from 'react';
import { Trophy, Star, Users, Loader2 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { pointsApi } from '../api/points';

interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  starPoints: string;
  referrals?: number;
}

export default function Leaderboard() {
  const { connected, connectWallet, address } = useWallet();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connected) {
      fetchLeaderboard();
    } else {
      setLoading(false);
    }
  }, [connected]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pointsApi.getLeaderboard(50);
      setLeaderboard(data);
    } catch (err: any) {
      console.error('Failed to fetch leaderboard:', err);
      setError(err.response?.data?.error || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-[#FFD700]';
    if (rank === 2) return 'text-[#C0C0C0]';
    if (rank === 3) return 'text-[#CD7F32]';
    return 'text-gray-400';
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#1A1D23] border border-[#2B3139] rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#FCD535] to-[#E5C430] rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your Stellar wallet to view the STAR leaderboard and see where you rank among other holders.
          </p>
          <button
            onClick={connectWallet}
            className="w-full bg-[#FCD535] text-black py-3 rounded-lg font-bold hover:bg-[#E5C430] transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#FCD535] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#1A1D23] border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Leaderboard</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="w-full bg-[#FCD535] text-black py-3 rounded-lg font-bold hover:bg-[#E5C430] transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] pb-20">
      <div className="max-w-5xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#FCD535]/10 border border-[#FCD535]/30 px-4 py-2 rounded-full mb-6">
            <Trophy className="w-5 h-5 text-[#FCD535]" />
            <span className="text-[#FCD535] font-semibold">Top STAR Holders</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Leaderboard
          </h1>
          <p className="text-xl text-gray-400">
            Top 50 users ranked by STAR balance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1A1D23] border border-[#2B3139] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-[#FCD535]" />
              <span className="text-gray-400 text-sm">Total Participants</span>
            </div>
            <div className="text-2xl font-bold text-white">{leaderboard.length}</div>
          </div>

          <div className="bg-[#1A1D23] border border-[#2B3139] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-[#FCD535]" />
              <span className="text-gray-400 text-sm">Top Holder</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {leaderboard.length > 0 ? parseFloat(leaderboard[0].starPoints).toLocaleString() : '0'}
            </div>
          </div>

          <div className="bg-[#1A1D23] border border-[#2B3139] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-[#FCD535]" />
              <span className="text-gray-400 text-sm">Your Rank</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {leaderboard.findIndex(entry => entry.walletAddress === address) + 1 || 'N/A'}
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-[#1A1D23] border border-[#2B3139] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2B3139]">
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold text-sm">Rank</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold text-sm">Wallet Address</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-semibold text-sm">STAR Balance</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-semibold text-sm">Referrals</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.walletAddress === address;
                  return (
                    <tr
                      key={entry.walletAddress}
                      className={`border-b border-[#2B3139] transition-colors ${
                        isCurrentUser ? 'bg-[#FCD535]/5' : 'hover:bg-[#2B3139]/30'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 ${getMedalColor(entry.rank)}`}>
                          {entry.rank <= 3 ? (
                            <Trophy className="w-5 h-5" />
                          ) : null}
                          <span className={`font-bold ${entry.rank <= 3 ? 'text-xl' : 'text-lg'}`}>
                            #{entry.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono ${isCurrentUser ? 'text-[#FCD535] font-bold' : 'text-white'}`}>
                            {truncateAddress(entry.walletAddress)}
                          </span>
                          {isCurrentUser && (
                            <span className="text-xs bg-[#FCD535] text-black px-2 py-0.5 rounded-full font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Star className="w-4 h-4 text-[#FCD535]" />
                          <span className="text-white font-bold">
                            {parseFloat(entry.starPoints).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">
                            {entry.referrals || 0}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-16">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No entries yet. Be the first!</p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Leaderboard updates in real-time based on STAR point balances
          </p>
        </div>
      </div>
    </div>
  );
}
