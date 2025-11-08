import { useState, useEffect } from 'react'
import { Plus, Droplets, TrendingUp, Info, Loader2, X, CheckCircle, XCircle, ExternalLink, Minus, ArrowDown } from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import { usePools } from '../hooks/usePools'
import { LiquidityPool, AccountBalance } from '../types/stellar'
import * as StellarSdk from '@stellar/stellar-sdk'
import { api } from '../api/client'

interface LPPosition {
  pool: LiquidityPool
  shares: string
  poolShare: number
  estimatedValueA: string
  estimatedValueB: string
}

export default function LiquidityPage() {
  const { connected, connectWallet, balances, address, signAndSubmitTransaction, getAccountBalances } = useWallet()
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null)
  const [userPositions, setUserPositions] = useState<LPPosition[]>([])
  const [loadingPositions, setLoadingPositions] = useState(false)
  
  const [assetAAmount, setAssetAAmount] = useState('')
  const [assetBAmount, setAssetBAmount] = useState('')
  const [calculatedShares, setCalculatedShares] = useState<string>('')
  const [poolShare, setPoolShare] = useState<string>('')
  
  const [removeAmount, setRemoveAmount] = useState('')
  const [removePercentage, setRemovePercentage] = useState(50)
  
  const [isAdding, setIsAdding] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)
  const [txSuccess, setTxSuccess] = useState<{ hash: string; type: 'add' | 'remove'; details: string } | null>(null)
  
  const { data: poolsData, isLoading: poolsLoading } = usePools(100)
  
  const allPools = poolsData?.pools || []
  const top20Pools = allPools.slice(0, 20)
  const pools = activeTab === 'all' ? top20Pools : userPositions

  const parseAssetFromString = (assetStr: string) => {
    if (assetStr === 'native' || assetStr === 'XLM') {
      return { code: 'XLM', issuer: 'native' }
    }
    const parts = assetStr.split(':')
    return { code: parts[0], issuer: parts[1] || 'unknown' }
  }

  const formatPoolReserves = (pool: LiquidityPool) => {
    if (!pool.reserves || pool.reserves.length < 2) {
      return { 
        assetA: 'Unknown', 
        assetB: 'Unknown', 
        assetAIssuer: 'unknown',
        assetBIssuer: 'unknown',
        amountA: '0', 
        amountB: '0' 
      }
    }
    
    const assetA = parseAssetFromString(pool.reserves[0].asset)
    const assetB = parseAssetFromString(pool.reserves[1].asset)
    
    return { 
      assetA: assetA.code, 
      assetB: assetB.code,
      assetAIssuer: assetA.issuer,
      assetBIssuer: assetB.issuer,
      amountA: parseFloat(pool.reserves[0].amount).toFixed(2),
      amountB: parseFloat(pool.reserves[1].amount).toFixed(2)
    }
  }

  const calculateTVL = (pool: LiquidityPool) => {
    if (!pool.reserves || pool.reserves.length < 2) return 0
    const amount = parseFloat(pool.reserves[0].amount) + parseFloat(pool.reserves[1].amount)
    return amount * 0.1
  }

  const getTotalTVL = () => {
    return allPools.reduce((sum: number, pool: LiquidityPool) => sum + calculateTVL(pool), 0)
  }

  const getBalance = (assetCode: string, assetIssuer: string) => {
    if (!balances.length) return '0.00'
    
    const balance = balances.find((b: AccountBalance) => {
      if (assetCode === 'XLM' && b.asset_type === 'native') {
        return true
      }
      return b.asset_code === assetCode && b.asset_issuer === assetIssuer
    })
    
    return balance ? parseFloat(balance.balance).toFixed(2) : '0.00'
  }

  const fetchUserLPPositions = async () => {
    if (!address || !connected) {
      setUserPositions([])
      return
    }

    setLoadingPositions(true)
    try {
      const server = new StellarSdk.Horizon.Server('https://horizon.stellar.org')
      const account = await server.loadAccount(address)
      
      const lpBalances = account.balances.filter((b: any) => b.asset_type === 'liquidity_pool_shares')
      
      const positions: LPPosition[] = []
      
      for (const lpBalance of lpBalances as any[]) {
        const poolId = lpBalance.liquidity_pool_id
        const pool = allPools.find((p: LiquidityPool) => p.id === poolId)
        
        if (pool && pool.reserves && pool.reserves.length >= 2) {
          const userShares = parseFloat(lpBalance.balance)
          const totalShares = parseFloat(pool.total_shares)
          const sharePercentage = (userShares / totalShares) * 100
          
          const reserveA = parseFloat(pool.reserves[0].amount)
          const reserveB = parseFloat(pool.reserves[1].amount)
          
          const estimatedValueA = ((userShares / totalShares) * reserveA).toFixed(7)
          const estimatedValueB = ((userShares / totalShares) * reserveB).toFixed(7)
          
          positions.push({
            pool,
            shares: lpBalance.balance,
            poolShare: sharePercentage,
            estimatedValueA,
            estimatedValueB
          })
        }
      }
      
      setUserPositions(positions)
    } catch (error) {
      console.error('Error fetching LP positions:', error)
      setUserPositions([])
    } finally {
      setLoadingPositions(false)
    }
  }

  useEffect(() => {
    if (connected && address && allPools.length > 0) {
      fetchUserLPPositions()
    }
  }, [connected, address, allPools.length])

  useEffect(() => {
    if (selectedPool && assetAAmount && assetBAmount) {
      calculateLPShares()
    } else {
      setCalculatedShares('')
      setPoolShare('')
    }
  }, [assetAAmount, assetBAmount, selectedPool])

  const calculateLPShares = async () => {
    if (!selectedPool || !assetAAmount || !assetBAmount) return

    try {
      const result = await api.calculateLPShares(selectedPool.id, assetAAmount, assetBAmount)
      if (result.success) {
        setCalculatedShares(result.shares)
        setPoolShare(result.poolShare)
      }
    } catch (error) {
      console.error('Error calculating shares:', error)
    }
  }

  const buildDepositTransaction = async () => {
    if (!selectedPool || !address || !assetAAmount || !assetBAmount) {
      throw new Error('Missing required data for deposit')
    }

    const server = new StellarSdk.Horizon.Server('https://horizon.stellar.org')
    const account = await server.loadAccount(address)

    const { assetA, assetB, assetAIssuer, assetBIssuer } = formatPoolReserves(selectedPool)

    const stellarAssetA = assetA === 'XLM'
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(assetA, assetAIssuer)

    const stellarAssetB = assetB === 'XLM'
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(assetB, assetBIssuer)

    const lpAsset = new StellarSdk.LiquidityPoolAsset(stellarAssetA, stellarAssetB, StellarSdk.LiquidityPoolFeeV18)

    const maxPrice = {
      n: parseInt((parseFloat(assetBAmount) * 1000000).toFixed(0)),
      d: parseInt((parseFloat(assetAAmount) * 1000000).toFixed(0))
    }

    const minPrice = {
      n: parseInt((parseFloat(assetBAmount) * 0.9 * 1000000).toFixed(0)),
      d: parseInt((parseFloat(assetAAmount) * 1.1 * 1000000).toFixed(0))
    }

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.PUBLIC,
    })
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset: lpAsset,
        })
      )
      .addOperation(
        StellarSdk.Operation.liquidityPoolDeposit({
          liquidityPoolId: selectedPool.id,
          maxAmountA: assetAAmount,
          maxAmountB: assetBAmount,
          minPrice: minPrice,
          maxPrice: maxPrice,
        })
      )
      .setTimeout(180)
      .build()

    return transaction.toXDR()
  }

  const buildWithdrawTransaction = async (position: LPPosition, amount: string) => {
    if (!address || !amount) {
      throw new Error('Missing required data for withdrawal')
    }

    const server = new StellarSdk.Horizon.Server('https://horizon.stellar.org')
    const account = await server.loadAccount(address)

    const userShares = parseFloat(amount)
    const totalShares = parseFloat(position.pool.total_shares)
    const shareRatio = userShares / totalShares

    const minAmountA = (parseFloat(position.pool.reserves[0].amount) * shareRatio * 0.95).toFixed(7)
    const minAmountB = (parseFloat(position.pool.reserves[1].amount) * shareRatio * 0.95).toFixed(7)

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.PUBLIC,
    })
      .addOperation(
        StellarSdk.Operation.liquidityPoolWithdraw({
          liquidityPoolId: position.pool.id,
          amount: amount,
          minAmountA: minAmountA,
          minAmountB: minAmountB,
        })
      )
      .setTimeout(180)
      .build()

    return transaction.toXDR()
  }

  const handleAddLiquidity = async () => {
    if (!connected) {
      connectWallet()
      return
    }

    if (!selectedPool || !assetAAmount || !assetBAmount) {
      setTxError('Please select a pool and enter amounts')
      return
    }

    const { assetA, assetB, assetAIssuer, assetBIssuer } = formatPoolReserves(selectedPool)
    const balanceA = getBalance(assetA, assetAIssuer)
    const balanceB = getBalance(assetB, assetBIssuer)

    if (parseFloat(assetAAmount) > parseFloat(balanceA)) {
      setTxError(`Insufficient ${assetA} balance`)
      return
    }

    if (parseFloat(assetBAmount) > parseFloat(balanceB)) {
      setTxError(`Insufficient ${assetB} balance`)
      return
    }

    setIsAdding(true)
    setTxError(null)
    setTxSuccess(null)

    try {
      const xdr = await buildDepositTransaction()
      const result = await signAndSubmitTransaction(xdr)
      
      if (result && result.hash) {
        const { assetA, assetB } = formatPoolReserves(selectedPool)
        setTxSuccess({
          hash: result.hash,
          type: 'add',
          details: `Added ${assetAAmount} ${assetA} and ${assetBAmount} ${assetB}`
        })
        
        setAssetAAmount('')
        setAssetBAmount('')
        setSelectedPool(null)
        setShowAddModal(false)
        
        await getAccountBalances()
        await fetchUserLPPositions()
      } else {
        throw new Error('Transaction submission failed')
      }
    } catch (error: any) {
      console.error('Add liquidity error:', error)
      
      let errorMessage = 'Failed to add liquidity. Please try again.'
      
      if (error.message?.includes('insufficient balance')) {
        errorMessage = 'Insufficient balance for this transaction'
      } else if (error.message?.includes('trustline')) {
        errorMessage = 'You need to add a trustline for this asset first'
      } else if (error.message?.includes('User declined')) {
        errorMessage = 'Transaction was rejected'
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Transaction timed out. Please try again.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setTxError(errorMessage)
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveLiquidity = async (position: LPPosition) => {
    if (!connected) {
      connectWallet()
      return
    }

    if (!removeAmount || parseFloat(removeAmount) <= 0) {
      setTxError('Please enter a valid amount to remove')
      return
    }

    if (parseFloat(removeAmount) > parseFloat(position.shares)) {
      setTxError('Amount exceeds your LP shares')
      return
    }

    setIsRemoving(true)
    setTxError(null)
    setTxSuccess(null)

    try {
      const xdr = await buildWithdrawTransaction(position, removeAmount)
      const result = await signAndSubmitTransaction(xdr)
      
      if (result && result.hash) {
        const { assetA, assetB } = formatPoolReserves(position.pool)
        setTxSuccess({
          hash: result.hash,
          type: 'remove',
          details: `Removed ${removeAmount} LP shares from ${assetA}/${assetB} pool`
        })
        
        setRemoveAmount('')
        setShowRemoveModal(false)
        setSelectedPool(null)
        
        await getAccountBalances()
        await fetchUserLPPositions()
      } else {
        throw new Error('Transaction submission failed')
      }
    } catch (error: any) {
      console.error('Remove liquidity error:', error)
      
      let errorMessage = 'Failed to remove liquidity. Please try again.'
      
      if (error.message?.includes('User declined')) {
        errorMessage = 'Transaction was rejected'
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Transaction timed out. Please try again.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setTxError(errorMessage)
    } finally {
      setIsRemoving(false)
    }
  }

  const handlePercentageClick = (percentage: number, position: LPPosition) => {
    setRemovePercentage(percentage)
    const amount = (parseFloat(position.shares) * (percentage / 100)).toFixed(7)
    setRemoveAmount(amount)
  }

  const AddLiquidityModal = () => {
    if (!showAddModal) return null

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
        <div className="bg-[#1E2329] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#2B3139]" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b border-[#2B3139] sticky top-0 bg-[#1E2329] z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Add Liquidity</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-4">
            {!selectedPool ? (
              <>
                <p className="text-sm text-gray-400 mb-4">
                  Select a liquidity pool to add liquidity
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allPools.map((pool: LiquidityPool) => {
                    const { assetA, assetB } = formatPoolReserves(pool)
                    return (
                      <button
                        key={pool.id}
                        onClick={() => setSelectedPool(pool)}
                        className="w-full p-3 bg-[#0B0E11] hover:bg-[#2B3139] rounded-lg transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FCD535] to-[#F7931A] flex items-center justify-center text-xs font-bold">
                            {assetA.substring(0, 2)}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold -ml-2">
                            {assetB.substring(0, 2)}
                          </div>
                          <span className="font-semibold text-white ml-2">
                            {assetA} / {assetB}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {pool.fee_bp / 100}% fee
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectedPool(null)
                    setAssetAAmount('')
                    setAssetBAmount('')
                  }}
                  className="text-sm text-[#FCD535] mb-4 hover:underline"
                >
                  ← Change Pool
                </button>

                <div className="bg-[#0B0E11] rounded-xl p-4 mb-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">
                      {formatPoolReserves(selectedPool).assetA}
                    </span>
                    <span className="text-xs text-gray-400">
                      Balance: {getBalance(formatPoolReserves(selectedPool).assetA, formatPoolReserves(selectedPool).assetAIssuer)}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={assetAAmount}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setAssetAAmount(value)
                        if (value && selectedPool && selectedPool.reserves) {
                          const reserveA = parseFloat(selectedPool.reserves[0].amount)
                          const reserveB = parseFloat(selectedPool.reserves[1].amount)
                          const ratio = reserveB / reserveA
                          setAssetBAmount((parseFloat(value) * ratio).toFixed(7))
                        }
                      }
                    }}
                    placeholder="0.0"
                    className="w-full bg-transparent text-2xl font-bold text-white outline-none"
                  />
                </div>

                <div className="flex justify-center -my-1">
                  <ArrowDown size={20} className="text-gray-400" />
                </div>

                <div className="bg-[#0B0E11] rounded-xl p-4 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">
                      {formatPoolReserves(selectedPool).assetB}
                    </span>
                    <span className="text-xs text-gray-400">
                      Balance: {getBalance(formatPoolReserves(selectedPool).assetB, formatPoolReserves(selectedPool).assetBIssuer)}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={assetBAmount}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setAssetBAmount(value)
                        if (value && selectedPool && selectedPool.reserves) {
                          const reserveA = parseFloat(selectedPool.reserves[0].amount)
                          const reserveB = parseFloat(selectedPool.reserves[1].amount)
                          const ratio = reserveA / reserveB
                          setAssetAAmount((parseFloat(value) * ratio).toFixed(7))
                        }
                      }
                    }}
                    placeholder="0.0"
                    className="w-full bg-transparent text-2xl font-bold text-white outline-none"
                  />
                </div>

                {calculatedShares && (
                  <div className="mt-4 p-3 bg-[#0B0E11] rounded-xl">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">LP Shares</span>
                      <span className="text-white font-semibold">{parseFloat(calculatedShares).toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Pool Share</span>
                      <span className="text-white font-semibold">{poolShare}%</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddLiquidity}
                  disabled={isAdding || !assetAAmount || !assetBAmount}
                  className="w-full mt-4 py-3 bg-[#FCD535] hover:bg-[#e6c430] disabled:bg-gray-600 disabled:cursor-not-allowed text-[#0B0E11] font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Adding Liquidity...</span>
                    </>
                  ) : (
                    <span>Add Liquidity</span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  const RemoveLiquidityModal = () => {
    if (!showRemoveModal || !selectedPool) return null

    const position = userPositions.find(p => p.pool.id === selectedPool.id)
    if (!position) return null

    const { assetA, assetB } = formatPoolReserves(position.pool)
    const withdrawPercentage = removeAmount ? (parseFloat(removeAmount) / parseFloat(position.shares)) * 100 : 0
    const estimatedA = removeAmount ? (parseFloat(position.estimatedValueA) * withdrawPercentage / 100).toFixed(7) : '0'
    const estimatedB = removeAmount ? (parseFloat(position.estimatedValueB) * withdrawPercentage / 100).toFixed(7) : '0'

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowRemoveModal(false)}>
        <div className="bg-[#1E2329] rounded-2xl max-w-md w-full border border-[#2B3139]" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b border-[#2B3139]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Remove Liquidity</h2>
              <button
                onClick={() => setShowRemoveModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Amount to Remove</span>
                <span className="text-sm text-gray-400">
                  Your shares: {parseFloat(position.shares).toFixed(4)}
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handlePercentageClick(pct, position)}
                    className={`flex-1 py-2 rounded-lg transition-all ${
                      removePercentage === pct
                        ? 'bg-[#FCD535] text-[#0B0E11] font-bold'
                        : 'bg-[#0B0E11] text-white hover:bg-[#2B3139]'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={removeAmount}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setRemoveAmount(value)
                    if (value) {
                      const pct = (parseFloat(value) / parseFloat(position.shares)) * 100
                      setRemovePercentage(Math.min(100, pct))
                    }
                  }
                }}
                placeholder="0.0"
                className="w-full px-4 py-3 bg-[#0B0E11] rounded-lg text-white text-xl font-bold outline-none border border-[#2B3139] focus:border-[#FCD535]"
              />
            </div>

            <div className="bg-[#0B0E11] rounded-xl p-4 mb-4">
              <div className="text-xs text-gray-400 mb-3">You will receive</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{assetA}</span>
                  <span className="text-white font-semibold">{estimatedA}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{assetB}</span>
                  <span className="text-white font-semibold">{estimatedB}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleRemoveLiquidity(position)}
              disabled={isRemoving || !removeAmount || parseFloat(removeAmount) <= 0}
              className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Removing Liquidity...</span>
                </>
              ) : (
                <span>Remove Liquidity</span>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const SuccessNotification = () => {
    if (!txSuccess) return null

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setTxSuccess(null)}>
        <div className="bg-[#1E2329] rounded-2xl max-w-md w-full border border-[#2B3139]" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-[#10B981]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {txSuccess.type === 'add' ? 'Liquidity Added!' : 'Liquidity Removed!'}
              </h3>
              <p className="text-gray-400 mb-4">{txSuccess.details}</p>
              
              <div className="w-full bg-[#0B0E11] rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Transaction Hash</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-white font-mono truncate flex-1">
                    {txSuccess.hash}
                  </code>
                </div>
              </div>

              <a
                href={`https://stellar.expert/explorer/public/tx/${txSuccess.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#FCD535] hover:bg-[#e6c430] text-[#0B0E11] font-bold rounded-xl transition-all flex items-center justify-center gap-2 mb-3"
              >
                View on Stellar Expert
                <ExternalLink size={16} />
              </a>

              <button
                onClick={() => setTxSuccess(null)}
                className="w-full py-3 bg-[#2B3139] hover:bg-[#3B4149] text-white font-medium rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const ErrorNotification = () => {
    if (!txError) return null

    return (
      <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
        <div className="bg-[#1E2329] border border-red-500/50 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle size={20} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold mb-1">Transaction Failed</h4>
              <p className="text-sm text-gray-400">{txError}</p>
            </div>
            <button
              onClick={() => setTxError(null)}
              className="text-gray-400 hover:text-white flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Liquidity Pools</h1>
            <p className="text-sm text-gray-400 mt-1">Provide liquidity and earn trading fees</p>
          </div>
          <button
            onClick={() => connected ? setShowAddModal(true) : connectWallet()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FCD535] hover:bg-[#e6c430] text-[#0B0E11] font-semibold rounded-lg transition-all"
          >
            <Plus size={18} />
            <span>Add Liquidity</span>
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            All Pools
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'my'
                ? 'bg-[#FCD535] text-[#0B0E11]'
                : 'bg-[#1E2329] text-gray-400 hover:bg-[#2B3139]'
            }`}
          >
            My Positions {userPositions.length > 0 && `(${userPositions.length})`}
          </button>
        </div>

        <div className="grid gap-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1E2329] rounded-xl p-4 border border-[#2B3139]">
              <div className="flex items-center gap-2 mb-2">
                <Droplets size={18} className="text-[#FCD535]" />
                <span className="text-sm text-gray-400">Total Value Locked</span>
              </div>
              {poolsLoading ? (
                <Loader2 className="animate-spin text-gray-400" size={24} />
              ) : (
                <div className="text-2xl font-bold text-white">
                  ${(getTotalTVL() / 1000000).toFixed(2)}M
                </div>
              )}
            </div>
            <div className="bg-[#1E2329] rounded-xl p-4 border border-[#2B3139]">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-green-400" />
                <span className="text-sm text-gray-400">My Positions</span>
              </div>
              {loadingPositions ? (
                <Loader2 className="animate-spin text-gray-400" size={24} />
              ) : (
                <div className="text-2xl font-bold text-white">{userPositions.length}</div>
              )}
            </div>
            <div className="bg-[#1E2329] rounded-xl p-4 border border-[#2B3139]">
              <div className="flex items-center gap-2 mb-2">
                <Plus size={18} className="text-blue-400" />
                <span className="text-sm text-gray-400">Active Pools</span>
              </div>
              {poolsLoading ? (
                <Loader2 className="animate-spin text-gray-400" size={24} />
              ) : (
                <div className="text-2xl font-bold text-white">{allPools.length}</div>
              )}
            </div>
          </div>
        </div>

        {poolsLoading || loadingPositions ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-[#FCD535]" size={48} />
          </div>
        ) : (
          <div className="space-y-3">
            {activeTab === 'all' ? (
              allPools.map((pool: LiquidityPool) => {
                const { assetA, assetB, amountA, amountB } = formatPoolReserves(pool)
                
                return (
                  <div
                    key={pool.id}
                    className="bg-[#1E2329] hover:bg-[#2B3139] rounded-xl p-4 border border-[#2B3139] hover:border-[#FCD535]/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FCD535] to-[#F7931A] flex items-center justify-center font-bold text-xs">
                            {assetA.substring(0, 3)}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs -ml-3 border-2 border-[#1E2329]">
                            {assetB.substring(0, 3)}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {assetA} / {assetB}
                          </div>
                          <div className="text-xs text-gray-400">
                            Pool ID: {pool.id.substring(0, 8)}...{pool.id.substring(pool.id.length - 8)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPool(pool)
                          setShowAddModal(true)
                        }}
                        className="px-4 py-2 bg-[#FCD535] hover:bg-[#e6c430] text-[#0B0E11] font-medium rounded-lg transition-all text-sm"
                      >
                        Add Liquidity
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Reserves</div>
                        <div className="font-semibold text-white text-sm">
                          {amountA} {assetA}
                        </div>
                        <div className="font-semibold text-white text-sm">
                          {amountB} {assetB}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Total Shares</div>
                        <div className="font-semibold text-white">
                          {parseFloat(pool.total_shares).toFixed(0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Fee</div>
                        <div className="font-semibold text-green-400">
                          {pool.fee_bp / 100}%
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              userPositions.map((position: LPPosition) => {
                const { assetA, assetB } = formatPoolReserves(position.pool)
                
                return (
                  <div
                    key={position.pool.id}
                    className="bg-[#1E2329] rounded-xl p-4 border border-[#2B3139] hover:border-[#FCD535]/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FCD535] to-[#F7931A] flex items-center justify-center font-bold text-xs">
                            {assetA.substring(0, 3)}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs -ml-3 border-2 border-[#1E2329]">
                            {assetB.substring(0, 3)}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {assetA} / {assetB}
                          </div>
                          <div className="text-xs text-gray-400">
                            Your share: {position.poolShare.toFixed(4)}%
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPool(position.pool)
                          setShowRemoveModal(true)
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all text-sm flex items-center gap-2"
                      >
                        <Minus size={16} />
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Your Position</div>
                        <div className="font-semibold text-white text-sm">
                          {parseFloat(position.estimatedValueA).toFixed(4)} {assetA}
                        </div>
                        <div className="font-semibold text-white text-sm">
                          {parseFloat(position.estimatedValueB).toFixed(4)} {assetB}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">LP Shares</div>
                        <div className="font-semibold text-white">
                          {parseFloat(position.shares).toFixed(4)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Fee</div>
                        <div className="font-semibold text-green-400">
                          {position.pool.fee_bp / 100}%
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            {pools.length === 0 && !poolsLoading && !loadingPositions && (
              <div className="text-center py-16">
                <div className="inline-flex p-4 bg-[#1E2329] rounded-2xl mb-4">
                  <Droplets className="text-gray-500" size={40} />
                </div>
                <p className="text-white mb-1 font-medium">
                  {activeTab === 'my' ? 'No liquidity positions' : 'No pools available'}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  {activeTab === 'my' 
                    ? 'Add liquidity to start earning trading fees'
                    : 'Check back later for available pools'
                  }
                </p>
                {activeTab === 'my' && (
                  <button
                    onClick={() => {
                      setActiveTab('all')
                      if (connected) setShowAddModal(true)
                      else connectWallet()
                    }}
                    className="px-6 py-2.5 bg-[#FCD535] hover:bg-[#e6c430] text-[#0B0E11] font-semibold rounded-lg transition-all"
                  >
                    Browse Pools
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3">
          <Info size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-300">
            <p className="font-semibold mb-1">About Liquidity Pools</p>
            <p className="text-xs">
              These are real liquidity pools from Stellar mainnet. When you add liquidity, you'll receive LP tokens representing your share of the pool. 
              You'll earn a portion of trading fees proportional to your share. Removing liquidity 
              burns your LP tokens and returns your share of the pool plus earned fees.
            </p>
          </div>
        </div>
      </div>

      <AddLiquidityModal />
      <RemoveLiquidityModal />
      <SuccessNotification />
      <ErrorNotification />
    </div>
  )
}
