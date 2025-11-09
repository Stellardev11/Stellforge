import { useState, useEffect } from 'react'
import { X, Flame, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import { pointsApi } from '../api/points'

interface BurnStarModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
  projectSymbol: string
}

export default function BurnStarModal({ isOpen, onClose, projectId, projectName, projectSymbol }: BurnStarModalProps) {
  const { connected, address } = useWallet()
  const [starBalance, setStarBalance] = useState<number>(0)
  const [burnAmount, setBurnAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [estimatedTokens, setEstimatedTokens] = useState<number>(0)

  useEffect(() => {
    if (isOpen && connected && address) {
      fetchBalance()
    }
  }, [isOpen, connected, address])

  useEffect(() => {
    if (burnAmount && !isNaN(parseFloat(burnAmount))) {
      const amount = parseFloat(burnAmount)
      setEstimatedTokens(amount * 10)
    } else {
      setEstimatedTokens(0)
    }
  }, [burnAmount])

  const fetchBalance = async () => {
    if (!address) return
    
    setLoadingBalance(true)
    try {
      const balance = await pointsApi.getBalance(address)
      setStarBalance(parseFloat(balance.starPoints))
    } catch (err) {
      console.error('Failed to fetch balance:', err)
      setError('Failed to fetch STAR balance')
    } finally {
      setLoadingBalance(false)
    }
  }

  const handleBurn = async () => {
    if (!connected) {
      setError('Please connect your wallet first')
      return
    }

    if (!address) {
      setError('Wallet address not found')
      return
    }

    const amount = parseFloat(burnAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amount > starBalance) {
      setError('Insufficient STAR balance')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await pointsApi.burnStar(address, projectId, amount)
      
      setSuccess(`Successfully burned ${result.starBurned} STAR!`)
      setBurnAmount('')
      
      await fetchBalance()
      
      setTimeout(() => {
        onClose()
        setSuccess('')
      }, 2000)
    } catch (err: any) {
      console.error('Burn failed:', err)
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to burn STAR. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  const handleMaxClick = () => {
    setBurnAmount(starBalance.toString())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#1E2329] border border-[#2B3139] rounded-2xl shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FCD535]/10 rounded-lg">
                <Flame className="text-[#FCD535]" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Burn STAR</h2>
                <p className="text-sm text-gray-400">{projectName} ({projectSymbol})</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2B3139] rounded-lg transition-colors"
            >
              <X className="text-gray-400" size={20} />
            </button>
          </div>

          {!connected ? (
            <div className="text-center py-8">
              <div className="inline-flex p-4 bg-[#0B0E11] rounded-full mb-4">
                <AlertCircle className="text-[#FCD535]" size={40} />
              </div>
              <p className="text-white mb-2">Wallet Connection Required</p>
              <p className="text-sm text-gray-400">Please connect your wallet using the button in the top navigation to burn STAR</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#0B0E11] rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Your STAR Balance</span>
                  {loadingBalance && <Loader2 className="text-gray-400 animate-spin" size={14} />}
                </div>
                <p className="text-2xl font-bold text-white">
                  {starBalance.toLocaleString()} STAR
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount to Burn</label>
                <div className="relative">
                  <input
                    type="number"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-[#FCD535] transition-all"
                    disabled={loading}
                  />
                  <button
                    onClick={handleMaxClick}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#FCD535]/10 hover:bg-[#FCD535]/20 text-[#FCD535] text-sm font-semibold rounded transition-all"
                    disabled={loading}
                  >
                    MAX
                  </button>
                </div>
              </div>

              {burnAmount && parseFloat(burnAmount) > 0 && (
                <div className="bg-[#0B0E11] rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Flame className="text-orange-500" size={16} />
                    <span className="text-gray-400">Burn Distribution:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1E2329] rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Destroyed</p>
                      <p className="text-lg font-bold text-orange-500">
                        {(parseFloat(burnAmount) * 0.5).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">50% burned</p>
                    </div>
                    <div className="bg-[#1E2329] rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">To Creator</p>
                      <p className="text-lg font-bold text-[#FCD535]">
                        {(parseFloat(burnAmount) * 0.5).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">50% to project</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#2B3139]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Estimated {projectSymbol}</span>
                      <span className="text-lg font-bold text-[#0ECB81]">
                        ~{estimatedTokens.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="text-red-500" size={18} />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="text-green-500" size={18} />
                  <p className="text-sm text-green-500">{success}</p>
                </div>
              )}

              <button
                onClick={handleBurn}
                disabled={loading || !burnAmount || parseFloat(burnAmount) <= 0 || parseFloat(burnAmount) > starBalance}
                className="w-full py-4 bg-[#FCD535] hover:bg-[#e6c430] disabled:bg-gray-600 disabled:cursor-not-allowed text-[#0B0E11] font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Burning...</span>
                  </>
                ) : (
                  <>
                    <Flame size={20} />
                    <span>Burn STAR</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By burning STAR, you participate in the {projectSymbol} airdrop distribution
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
