import { useState, useEffect } from 'react'
import { ArrowDownUp, Settings, Search, Loader2, ShieldCheck, AlertTriangle, CheckCircle, XCircle, ExternalLink, X } from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import { useAssets } from '../hooks/useAssets'
import { useSwapQuote } from '../hooks/useSwapQuote'
import { StellarAsset } from '../types/stellar'
import AssetIcon from './AssetIcon'
import * as StellarSdk from '@stellar/stellar-sdk'

function getAssetCode(asset: StellarAsset | null): string {
  if (!asset) return 'UNKNOWN'
  if (asset.asset_type === 'native') return 'XLM'
  return asset.asset_code || 'UNKNOWN'
}

function getAssetIssuer(asset: StellarAsset | null): string {
  if (!asset) return 'unknown'
  if (asset.asset_type === 'native') return 'native'
  return asset.asset_issuer || 'unknown'
}

export default function SwapPage() {
  const { connected, balances, address, signAndSubmitTransaction, getAccountBalances } = useWallet()
  const { data: assetsData, isLoading: assetsLoading } = useAssets(50)
  
  const [fromAsset, setFromAsset] = useState<StellarAsset | null>(null)
  const [toAsset, setToAsset] = useState<StellarAsset | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [showFromTokens, setShowFromTokens] = useState(false)
  const [showToTokens, setShowToTokens] = useState(false)
  const [tokenSearch, setTokenSearch] = useState('')
  
  const [isSwapping, setIsSwapping] = useState(false)
  const [swapError, setSwapError] = useState<string | null>(null)
  const [swapSuccess, setSwapSuccess] = useState<{ hash: string; fromAmount: string; toAmount: string; fromAsset: string; toAsset: string } | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [slippageTolerance, setSlippageTolerance] = useState(0.5)

  const assets = assetsData?.assets || []

  useEffect(() => {
    if (assets.length > 0 && !fromAsset) {
      const xlm = assets.find((a: StellarAsset) => a.asset_type === 'native' || getAssetCode(a) === 'XLM')
      if (xlm) setFromAsset(xlm)
    }
  }, [assets, fromAsset])

  const { data: quoteData, isLoading: quoteLoading } = useSwapQuote(
    getAssetCode(fromAsset),
    getAssetIssuer(fromAsset),
    getAssetCode(toAsset),
    getAssetIssuer(toAsset),
    fromAmount,
    'send'
  )

  const quote = quoteData?.quote

  const handleSwapTokens = () => {
    const temp = fromAsset
    setFromAsset(toAsset)
    setToAsset(temp)
    setFromAmount('')
  }

  const handleFromAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value)
    }
  }

  const buildSwapTransaction = async () => {
    if (!fromAsset || !toAsset || !quote || !address) {
      throw new Error('Missing required data for swap')
    }

    const server = new StellarSdk.Horizon.Server('https://horizon.stellar.org')
    const account = await server.loadAccount(address)

    const sourceAsset = fromAsset.asset_type === 'native'
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(getAssetCode(fromAsset), getAssetIssuer(fromAsset))

    const destAsset = toAsset.asset_type === 'native'
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(getAssetCode(toAsset), getAssetIssuer(toAsset))

    const path: StellarSdk.Asset[] = quote.path && quote.path.length > 0
      ? quote.path.map((p: any) => {
          if (p.asset_type === 'native') {
            return StellarSdk.Asset.native()
          }
          return new StellarSdk.Asset(p.asset_code, p.asset_issuer)
        })
      : []

    const minDestAmount = (parseFloat(quote.destination_amount) * (1 - slippageTolerance / 100)).toFixed(7)

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.PUBLIC,
    })
      .addOperation(
        StellarSdk.Operation.pathPaymentStrictSend({
          sendAsset: sourceAsset,
          sendAmount: fromAmount,
          destination: address,
          destAsset: destAsset,
          destMin: minDestAmount,
          path: path,
        })
      )
      .setTimeout(180)
      .build()

    return transaction.toXDR()
  }

  const handleSwap = async () => {
    if (!connected) {
      alert('Please connect your wallet using the button in the top navigation to perform swaps.')
      return
    }

    if (!fromAsset || !toAsset || !quote || !fromAmount) {
      setSwapError('Please select both assets and enter an amount')
      return
    }

    const balance = getBalance(fromAsset)
    if (parseFloat(fromAmount) > parseFloat(balance)) {
      setSwapError('Insufficient balance')
      return
    }

    setIsSwapping(true)
    setSwapError(null)
    setSwapSuccess(null)

    try {
      const xdr = await buildSwapTransaction()
      
      const result = await signAndSubmitTransaction(xdr)
      
      if (result && result.hash) {
        setSwapSuccess({
          hash: result.hash,
          fromAmount: fromAmount,
          toAmount: quote.destination_amount,
          fromAsset: getAssetCode(fromAsset),
          toAsset: getAssetCode(toAsset),
        })
        
        setFromAmount('')
        
        await getAccountBalances()
      } else {
        throw new Error('Transaction submission failed')
      }
    } catch (error: any) {
      console.error('Swap error:', error)
      
      let errorMessage = 'Swap failed. Please try again.'
      
      if (error.message?.includes('insufficient balance')) {
        errorMessage = 'Insufficient balance for this swap'
      } else if (error.message?.includes('trustline')) {
        errorMessage = 'You need to add a trustline for this asset first'
      } else if (error.message?.includes('User declined')) {
        errorMessage = 'Transaction was rejected'
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Transaction timed out. Please try again.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setSwapError(errorMessage)
    } finally {
      setIsSwapping(false)
    }
  }

  const getBalance = (asset: StellarAsset | null) => {
    if (!asset || !balances.length) return '0.00'
    
    const balance = balances.find(b => {
      if (asset.asset_type === 'native') {
        return b.asset_type === 'native'
      }
      const code = getAssetCode(asset)
      const issuer = getAssetIssuer(asset)
      return b.asset_code === code && b.asset_issuer === issuer
    })
    
    return balance ? parseFloat(balance.balance).toFixed(2) : '0.00'
  }

  const filteredAssets = assets.filter((asset: StellarAsset) => {
    const searchLower = tokenSearch.toLowerCase()
    const code = getAssetCode(asset).toLowerCase()
    const domain = asset.domain?.toLowerCase() || ''
    const issuer = getAssetIssuer(asset).toLowerCase()
    return code.includes(searchLower) || domain.includes(searchLower) || issuer.includes(searchLower)
  })

  const AssetSelector = ({ 
    onSelect, 
    show, 
    onClose 
  }: { 
    selectedAsset: StellarAsset | null
    onSelect: (asset: StellarAsset) => void
    show: boolean
    onClose: () => void
  }) => {
    if (!show) return null

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-[#1E2329] rounded-2xl max-w-md w-full max-h-[80vh] border border-[#2B3139]" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b border-[#2B3139]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Select Token</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by code, name, or issuer address"
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B0E11] rounded-lg text-white outline-none border border-[#2B3139] focus:border-[#FCD535]"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-96">
            {assetsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-[#FCD535]" size={32} />
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No assets found
              </div>
            ) : (
              filteredAssets.map((asset: StellarAsset, index: number) => {
                const code = getAssetCode(asset)
                const issuer = getAssetIssuer(asset)
                const isVerified = asset.verified || asset.toml_info?.verified || false
                return (
                  <button
                    key={`${code}-${issuer}-${index}`}
                    onClick={() => {
                      onSelect(asset)
                      onClose()
                      setTokenSearch('')
                    }}
                    className="w-full p-4 hover:bg-[#2B3139] transition-all flex items-center gap-3 border-b border-[#2B3139] last:border-0"
                  >
                    <AssetIcon 
                      assetCode={code}
                      imageUrl={asset.toml_info?.image || asset.image}
                      size="lg"
                    />
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{code}</span>
                        {isVerified ? (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-[#10B981]/20 rounded-full">
                            <ShieldCheck size={12} className="text-[#10B981]" />
                            <span className="text-xs text-[#10B981] font-medium">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-[#EAB308]/20 rounded-full">
                            <AlertTriangle size={12} className="text-[#EAB308]" />
                            <span className="text-xs text-[#EAB308] font-medium">Unverified</span>
                          </div>
                        )}
                      </div>
                      <div className={`text-xs truncate ${isVerified ? 'text-[#10B981]' : 'text-[#EAB308]'}`}>
                        {isVerified && asset.domain 
                          ? asset.domain 
                          : (issuer !== 'native' ? `${issuer.substring(0, 8)}...${issuer.substring(issuer.length - 8)}` : 'Stellar')
                        }
                      </div>
                    </div>
                    {asset.num_accounts && (
                      <div className="text-xs text-gray-400 flex-shrink-0">
                        {asset.num_accounts.toLocaleString()} holders
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

  const SettingsModal = () => {
    if (!showSettings) return null

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
        <div className="bg-[#1E2329] rounded-2xl max-w-md w-full border border-[#2B3139]" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b border-[#2B3139] flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Transaction Settings</h3>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Slippage Tolerance</label>
              <div className="flex gap-2 mb-3">
                {[0.1, 0.5, 1.0].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippageTolerance(value)}
                    className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                      slippageTolerance === value
                        ? 'bg-[#FCD535] text-[#0B0E11] font-bold'
                        : 'bg-[#0B0E11] text-white hover:bg-[#2B3139]'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="50"
                  value={slippageTolerance}
                  onChange={(e) => setSlippageTolerance(parseFloat(e.target.value) || 0.5)}
                  className="w-full px-3 py-2 bg-[#0B0E11] rounded-lg text-white outline-none border border-[#2B3139] focus:border-[#FCD535]"
                />
                <span className="absolute right-3 top-2.5 text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your transaction will revert if the price changes unfavorably by more than this percentage.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const SuccessNotification = () => {
    if (!swapSuccess) return null

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSwapSuccess(null)}>
        <div className="bg-[#1E2329] rounded-2xl max-w-md w-full border border-[#2B3139]" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-[#10B981]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Swap Successful!</h3>
              <p className="text-gray-400 mb-4">
                Swapped {parseFloat(swapSuccess.fromAmount).toFixed(6)} {swapSuccess.fromAsset} for {parseFloat(swapSuccess.toAmount).toFixed(6)} {swapSuccess.toAsset}
              </p>
              
              <div className="w-full bg-[#0B0E11] rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Transaction Hash</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-white font-mono truncate flex-1">
                    {swapSuccess.hash}
                  </code>
                </div>
              </div>

              <a
                href={`https://stellar.expert/explorer/public/tx/${swapSuccess.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#FCD535] hover:bg-[#e6c430] text-[#0B0E11] font-bold rounded-xl transition-all flex items-center justify-center gap-2 mb-3"
              >
                View on Stellar Expert
                <ExternalLink size={16} />
              </a>

              <button
                onClick={() => setSwapSuccess(null)}
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
    if (!swapError) return null

    return (
      <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
        <div className="bg-[#1E2329] border border-red-500/50 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle size={20} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold mb-1">Swap Failed</h4>
              <p className="text-sm text-gray-400">{swapError}</p>
            </div>
            <button
              onClick={() => setSwapError(null)}
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-[#FCD535] to-purple-500 bg-clip-text text-transparent">
            Lightning Swap
          </h1>
          <p className="text-sm text-gray-400">Trade tokens instantly on Stellar with best rates</p>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
              <span className="text-xs text-green-400">● Live Prices</span>
            </div>
            <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <span className="text-xs text-blue-400">⚡ Instant</span>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-[#1E2329] rounded-lg transition-all"
          >
            <Settings size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#1E2329] to-[#0B0E11] rounded-2xl p-4 sm:p-6 border border-[#2B3139] shadow-2xl shadow-[#FCD535]/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FCD535]/10 to-transparent rounded-full blur-3xl"></div>
          <div className="relative z-10">
          <div className="bg-[#0B0E11]/80 backdrop-blur-sm rounded-xl p-4 mb-2 border border-[#2B3139]/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">From</span>
              <span className="text-xs text-gray-400">
                Balance: {connected ? getBalance(fromAsset) : '0.00'}
              </span>
            </div>
            
            <button 
              onClick={() => setShowFromTokens(true)}
              className="w-full flex items-center justify-between gap-3 p-3 bg-[#2B3139] hover:bg-[#3B4149] rounded-lg transition-all mb-3"
            >
              <div className="flex items-center gap-2">
                {fromAsset ? (
                  <>
                    <AssetIcon 
                      assetCode={getAssetCode(fromAsset)}
                      imageUrl={fromAsset.toml_info?.image || fromAsset.image}
                      size="md"
                    />
                    <span className="font-bold text-white">{getAssetCode(fromAsset)}</span>
                  </>
                ) : (
                  <span className="font-bold text-white">Select Token</span>
                )}
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <input
              type="text"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              placeholder="0.0"
              className="w-full bg-transparent text-3xl font-bold text-white outline-none"
            />
          </div>

          <div className="flex justify-center -my-2 relative z-20">
            <button
              onClick={handleSwapTokens}
              className="p-3 bg-gradient-to-br from-[#FCD535] to-[#F7931A] hover:from-[#F7931A] hover:to-[#FCD535] rounded-xl border-4 border-[#0B0E11] transition-all hover:rotate-180 duration-300 shadow-lg shadow-[#FCD535]/50"
              disabled={!fromAsset || !toAsset}
            >
              <ArrowDownUp size={20} className="text-[#0B0E11]" />
            </button>
          </div>

          <div className="bg-[#0B0E11]/80 backdrop-blur-sm rounded-xl p-4 mt-2 border border-[#2B3139]/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">To</span>
              <span className="text-xs text-gray-400">
                Balance: {connected ? getBalance(toAsset) : '0.00'}
              </span>
            </div>
            
            <button 
              onClick={() => setShowToTokens(true)}
              className="w-full flex items-center justify-between gap-3 p-3 bg-[#2B3139] hover:bg-[#3B4149] rounded-lg transition-all mb-3"
            >
              <div className="flex items-center gap-2">
                {toAsset ? (
                  <>
                    <AssetIcon 
                      assetCode={getAssetCode(toAsset)}
                      imageUrl={toAsset.toml_info?.image || toAsset.image}
                      size="md"
                    />
                    <span className="font-bold text-white">{getAssetCode(toAsset)}</span>
                  </>
                ) : (
                  <span className="font-bold text-white">Select Token</span>
                )}
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {quoteLoading && fromAmount && toAsset ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-[#FCD535]" size={24} />
                <span className="text-gray-400 text-lg">Loading quote...</span>
              </div>
            ) : (
              <input
                type="text"
                value={quote?.destination_amount ? parseFloat(quote.destination_amount).toFixed(6) : ''}
                readOnly
                placeholder="0.0"
                className="w-full bg-transparent text-3xl font-bold text-white outline-none"
              />
            )}
          </div>

          {quote && fromAmount && (
            <div className="mt-4 p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Rate</span>
                <span className="text-white">
                  1 {getAssetCode(fromAsset)} ≈ {(parseFloat(quote.destination_amount) / parseFloat(fromAmount)).toFixed(6)} {getAssetCode(toAsset)}
                </span>
              </div>
              {quote.path && quote.path.length > 0 && (
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Path</span>
                  <span className="text-white text-xs">
                    {quote.path.length} hop{quote.path.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Slippage Tolerance</span>
                <span className="text-white">{slippageTolerance}%</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Minimum Received</span>
                <span className="text-white">
                  {(parseFloat(quote.destination_amount) * (1 - slippageTolerance / 100)).toFixed(6)} {getAssetCode(toAsset)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Network Fee</span>
                <span className="text-white">~0.00001 XLM</span>
              </div>
            </div>
          )}
          </div>
          
          <button
            onClick={handleSwap}
            className="w-full mt-4 py-4 bg-gradient-to-r from-[#FCD535] to-[#F7931A] hover:from-[#F7931A] hover:to-[#FCD535] text-[#0B0E11] font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#FCD535]/50 hover:shadow-[#FCD535]/70 hover:scale-[1.02]"
            disabled={!fromAmount || !toAsset || !fromAsset || quoteLoading || isSwapping}
          >
            {isSwapping && <Loader2 className="animate-spin" size={20} />}
            {!connected ? 'Connect Wallet' : isSwapping ? 'Swapping...' : quoteLoading ? 'Loading Quote...' : 'Swap'}
          </button>
        </div>
      </div>

      <AssetSelector 
        selectedAsset={fromAsset}
        onSelect={setFromAsset}
        show={showFromTokens}
        onClose={() => setShowFromTokens(false)}
      />

      <AssetSelector 
        selectedAsset={toAsset}
        onSelect={setToAsset}
        show={showToTokens}
        onClose={() => setShowToTokens(false)}
      />

      <SettingsModal />
      <SuccessNotification />
      <ErrorNotification />
    </div>
  )
}
