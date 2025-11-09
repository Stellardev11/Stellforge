import { useState } from 'react'
import { Rocket, ArrowRight, CheckCircle, Upload, Coins, HelpCircle, TrendingUp, Gift, Calendar, Lock, Loader2 } from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import { validateAllocation, validateLiquidityXLM, validateEventDuration } from '../utils/validation'
import { createStellarToken, completeTokenIssuance } from '../utils/stellarToken'
import { contractService } from '../services/contractService'

export default function TokenLaunchWizard() {
  const { connected, connectWallet, address, signAndSubmitTransaction } = useWallet()
  const [step, setStep] = useState(1)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [creationStatus, setCreationStatus] = useState<string>('')
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    decimals: '7',
    logoFile: null as File | null,
    description: '',
    airdropPercent: '40',
    liquidityPercent: '30',
    initialLiquidityXLM: '2000',
    eventDurationDays: '7',
    vestingEnabled: false,
    vestingMonths: '12',
  })

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, logoFile: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getAllocation = () => {
    return validateAllocation(
      parseInt(formData.airdropPercent || '0'),
      parseInt(formData.liquidityPercent || '0')
    )
  }

  const getAirdropTokens = () => {
    if (!formData.totalSupply) return 0
    const supply = parseInt(formData.totalSupply)
    const airdropPercent = parseInt(formData.airdropPercent || '0')
    return Math.floor((supply * airdropPercent) / 100)
  }

  const getLiquidityTokens = () => {
    if (!formData.totalSupply) return 0
    const supply = parseInt(formData.totalSupply)
    const liquidityPercent = parseInt(formData.liquidityPercent || '0')
    return Math.floor((supply * liquidityPercent) / 100)
  }

  const getCreatorTokens = () => {
    if (!formData.totalSupply) return 0
    const supply = parseInt(formData.totalSupply)
    const allocation = getAllocation()
    return Math.floor((supply * allocation.creator) / 100)
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.tokenName || !formData.tokenSymbol || !formData.totalSupply || !formData.description) {
        alert('Please fill in all required fields')
        return
      }
    }
    
    if (step === 2) {
      const allocation = getAllocation()
      if (!allocation.valid) {
        alert(allocation.error || 'Invalid allocation')
        return
      }
      const liquidityValidation = validateLiquidityXLM(parseInt(formData.initialLiquidityXLM || '0'))
      if (!liquidityValidation.valid) {
        alert(liquidityValidation.error || 'Invalid liquidity amount')
        return
      }
    }
    
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!connected || !address) {
      connectWallet()
      return
    }
    
    const allocation = getAllocation()
    if (!allocation.valid) {
      alert(allocation.error || 'Invalid allocation')
      return
    }
    
    const liquidityValidation = validateLiquidityXLM(parseInt(formData.initialLiquidityXLM || '0'))
    if (!liquidityValidation.valid) {
      alert(liquidityValidation.error)
      return
    }
    
    const eventValidation = validateEventDuration(parseInt(formData.eventDurationDays || '0'))
    if (!eventValidation.valid) {
      alert(eventValidation.error)
      return
    }

    setIsCreating(true)
    setCreationStatus('Creating Stellar token...')

    try {
      // Step 1: Create Stellar token
      const tokenResult = await createStellarToken({
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        decimals: formData.decimals,
        totalSupply: formData.totalSupply,
        mintable: false,
        burnable: false,
        userAddress: address,
        isTestnet: true, // Use testnet for demo
      })

      if (!tokenResult.success && tokenResult.message === 'NEEDS_TRUSTLINE_SIGNATURE') {
        setCreationStatus('Signing trustline transaction...')
        
        // Sign and submit the trustline transaction
        if (tokenResult.trustlineXDR) {
          await signAndSubmitTransaction(tokenResult.trustlineXDR)
          setCreationStatus('Trustline established. Issuing tokens...')
          
          // Step 2: Complete token issuance
          if (tokenResult.issuerSecretKey && tokenResult.assetCode) {
            const issuanceResult = await completeTokenIssuance(
              tokenResult.assetCode,
              tokenResult.issuerSecretKey,
              address,
              formData.totalSupply,
              true
            )

            if (!issuanceResult.success) {
              throw new Error(issuanceResult.message)
            }

            setCreationStatus('Token created! Registering campaign on Soroban...')

            // Step 3: Create campaign in Soroban contract
            const tokenAddress = tokenResult.issuerPublicKey || address
            const totalSupply = BigInt(parseInt(formData.totalSupply))
            const airdropPercent = BigInt(parseInt(formData.airdropPercent))
            const liquidityPercent = BigInt(parseInt(formData.liquidityPercent))

            const campaignXDR = await contractService.createCampaign(
              address,
              tokenAddress,
              totalSupply,
              airdropPercent,
              liquidityPercent
            )

            setCreationStatus('Signing campaign registration...')
            const campaignResult = await signAndSubmitTransaction(campaignXDR)
            console.log('Campaign registration result:', campaignResult)

            setCreationStatus('Success! Your token launch campaign is live! 🎉')
            
            // Show success for a moment then reset
            setTimeout(() => {
              alert(`Token ${formData.tokenSymbol} launched successfully!\n\nToken: ${tokenResult.assetCode}\nIssuer: ${tokenResult.issuerPublicKey}\nTransaction: ${issuanceResult.transactionHash}\n\nCampaign registered on Soroban contract!`)
              setIsCreating(false)
              setCreationStatus('')
            }, 2000)
          }
        }
      } else {
        throw new Error(tokenResult.message || 'Token creation failed')
      }
    } catch (error) {
      console.error('Token launch error:', error)
      setCreationStatus('')
      setIsCreating(false)
      alert(`Token launch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const stepTitles = [
    'Token Setup',
    'Allocation Settings',
    'Event & Launch'
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="text-gradient">Create Your Token</span>
          </h1>
          <p className="text-xl text-eth-grey-medium">Simple 3-step token creation with fair launch on Stellar</p>
        </div>

        <div className="flex items-center justify-center mb-10 overflow-x-auto pb-4 px-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center min-w-0">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all font-bold text-base sm:text-lg ${
                  s <= step 
                    ? 'bg-gradient-to-r from-bitcoin-orange to-bitcoin-orange-light text-white shadow-lg shadow-bitcoin-orange/50' 
                    : 'bg-pro-dark-lighter text-eth-grey'
                }`}>
                  {s < step ? <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7" /> : s}
                </div>
                <span className={`text-xs sm:text-sm mt-2 sm:mt-3 font-medium text-center max-w-[120px] ${s <= step ? 'text-stellar-cyan' : 'text-eth-grey'}`}>
                  {stepTitles[s - 1]}
                </span>
              </div>
              {s < 3 && (
                <div className={`w-12 sm:w-20 md:w-28 h-1.5 mx-1 sm:mx-2 md:mx-3 rounded-full ${s < step ? 'bg-gradient-to-r from-bitcoin-orange to-bitcoin-orange-light' : 'bg-pro-dark-lighter'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-pro-dark-card p-10 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Token Setup</h2>
                <p className="text-eth-grey">Define your token's core properties</p>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-eth-grey-medium mb-2">
                    <Coins className="w-4 h-4 text-bitcoin-orange" />
                    Token Name *
                  </label>
                  <input
                    type="text"
                    value={formData.tokenName}
                    onChange={(e) => setFormData({...formData, tokenName: e.target.value})}
                    className="w-full bg-pro-dark-lighter border border-white/10 rounded-lg px-4 py-3 text-white placeholder-eth-grey focus:outline-none focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent text-lg"
                    placeholder="e.g., Moon Token"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-eth-grey-medium mb-2">Symbol *</label>
                    <input
                      type="text"
                      value={formData.tokenSymbol}
                      onChange={(e) => setFormData({...formData, tokenSymbol: e.target.value.toUpperCase()})}
                      className="w-full bg-pro-dark-lighter border border-white/10 rounded-lg px-4 py-3 text-white placeholder-eth-grey focus:outline-none focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent text-lg font-semibold"
                      placeholder="MOON"
                      maxLength={12}
                      required
                    />
                    <p className="text-xs text-eth-grey mt-1">Ticker symbol (max 12 chars)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-eth-grey-medium mb-2">Total Supply *</label>
                    <input
                      type="number"
                      value={formData.totalSupply}
                      onChange={(e) => setFormData({...formData, totalSupply: e.target.value})}
                      className="w-full bg-pro-dark-lighter border border-white/10 rounded-lg px-4 py-3 text-white placeholder-eth-grey focus:outline-none focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent text-lg"
                      placeholder="1000000"
                      required
                    />
                    <p className="text-xs text-eth-grey mt-1">Maximum token supply</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-eth-grey-medium mb-2">
                      Decimals
                      <div className="group relative">
                        <HelpCircle className="w-4 h-4 text-eth-grey cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-pro-dark border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-10">
                          Number of decimal places. 7 is standard for Stellar.
                        </div>
                      </div>
                    </label>
                    <input
                      type="number"
                      value={formData.decimals}
                      onChange={(e) => setFormData({...formData, decimals: e.target.value})}
                      className="w-full bg-pro-dark-lighter border border-white/10 rounded-lg px-4 py-3 text-white placeholder-eth-grey focus:outline-none focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent text-lg"
                      min="0"
                      max="18"
                    />
                    <p className="text-xs text-eth-grey mt-1">Default: 7 (Stellar standard)</p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-eth-grey-medium mb-2">
                    <Coins className="w-4 h-4 text-stellar-cyan" />
                    Token Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-pro-dark-lighter border border-white/10 rounded-lg px-4 py-3 text-white placeholder-eth-grey focus:outline-none focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent min-h-36 text-base leading-relaxed"
                    placeholder="Describe your token, its purpose, and what makes it unique..."
                    rows={5}
                    maxLength={500}
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-eth-grey">Share your vision and use case</p>
                    <p className={`text-xs font-medium ${formData.description.length > 450 ? 'text-bitcoin-orange' : 'text-eth-grey'}`}>
                      {formData.description.length} / 500
                    </p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-eth-grey-medium mb-3">
                    <Upload className="w-4 h-4 text-stellar-cyan" />
                    Token Logo (Optional)
                  </label>
                  <div className="flex items-center gap-6">
                    {logoPreview && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-stellar-cyan shadow-lg shadow-stellar-cyan/20">
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="bg-pro-dark-lighter border-2 border-dashed border-white/20 hover:border-stellar-cyan transition-all duration-300 rounded-xl p-10 text-center hover:bg-pro-dark">
                        <Upload className="w-10 h-10 text-eth-grey mx-auto mb-3" />
                        <p className="text-sm text-eth-grey-medium font-medium">
                          {formData.logoFile ? formData.logoFile.name : 'Click to upload logo'}
                        </p>
                        <p className="text-xs text-eth-grey mt-2">PNG, JPG, or SVG • Recommended: 512x512px</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Allocation Settings</h2>
                <p className="text-eth-grey">Configure token distribution and liquidity</p>
              </div>

              <div className="bg-pro-dark-lighter p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-stellar-cyan" />
                  Token Distribution
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-eth-grey-medium">
                      <Gift className="w-4 h-4 text-stellar-cyan" />
                      Airdrop Allocation %
                      <div className="group relative">
                        <HelpCircle className="w-4 h-4 text-eth-grey cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-pro-dark border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-56 z-10">
                          Tokens distributed to airdrop participants based on entries and referrals. Minimum 10%.
                        </div>
                      </div>
                    </label>
                    <input 
                      type="number" 
                      value={formData.airdropPercent} 
                      onChange={(e) => setFormData({...formData, airdropPercent: e.target.value})} 
                      className="w-full bg-pro-dark border border-white/10 rounded-lg px-4 py-3 text-white placeholder-eth-grey focus:outline-none focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent text-lg font-semibold" 
                      min="10"
                      max="80"
                      placeholder="40"
                    />
                    <p className="text-xs text-stellar-cyan font-medium">
                      {getAirdropTokens().toLocaleString()} tokens
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-eth-grey-medium">
                      <Rocket className="w-4 h-4 text-bitcoin-orange" />
                      Liquidity Pool %
                      <div className="group relative">
                        <HelpCircle className="w-4 h-4 text-eth-grey cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-pro-dark border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-56 z-10">
                          Tokens for DEX liquidity pool. Paired with your XLM. Minimum 10%.
                        </div>
                      </div>
                    </label>
                    <input 
                      type="number" 
                      value={formData.liquidityPercent} 
                      onChange={(e) => setFormData({...formData, liquidityPercent: e.target.value})} 
                      className="w-full bg-pro-dark border border-white/10 rounded-lg px-4 py-3 text-white placeholder-eth-grey focus:outline-none focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent text-lg font-semibold" 
                      min="10"
                      max="80"
                      placeholder="30"
                    />
                    <p className="text-xs text-bitcoin-orange font-medium">
                      {getLiquidityTokens().toLocaleString()} tokens
                    </p>
                  </div>
                </div>

                <div className={`rounded-xl p-5 border-2 transition-all ${
                  getAllocation().valid
                    ? 'bg-gradient-to-r from-stellar-cyan/10 to-stellar-cyan/5 border-stellar-cyan/40' 
                    : 'bg-gradient-to-r from-accent-red/10 to-bitcoin-orange/10 border-accent-red/40'
                }`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-eth-grey mb-1">Creator Allocation</p>
                      <p className="text-2xl font-bold text-white">
                        {getAllocation().creator}%
                      </p>
                      <p className="text-xs text-stellar-cyan font-medium mt-1">
                        {getCreatorTokens().toLocaleString()} tokens → your wallet
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-eth-grey mb-1">Total Allocated</p>
                      <p className={`text-2xl font-bold ${getAllocation().valid ? 'text-stellar-cyan' : 'text-accent-red'}`}>
                        {getAllocation().total}%
                      </p>
                      {getAllocation().error && (
                        <p className="text-xs text-accent-red mt-1">{getAllocation().error}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-pro-dark-lighter p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-stellar-cyan" />
                  Liquidity Requirements
                </h3>

                <div className="space-y-2 mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-eth-grey-medium">
                    <Coins className="w-4 h-4 text-stellar-cyan" />
                    Initial Liquidity (XLM) *
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-eth-grey cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-pro-dark border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-10">
                        XLM you'll provide for liquidity pool. Minimum 2,000 XLM. Auto-launches DEX when event ends.
                      </div>
                    </div>
                  </label>
                  <input 
                    type="number" 
                    value={formData.initialLiquidityXLM} 
                    onChange={(e) => setFormData({...formData, initialLiquidityXLM: e.target.value})} 
                    className="w-full bg-pro-dark border border-white/10 rounded-lg px-4 py-3 text-white placeholder-eth-grey focus:outline-none focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent text-lg font-semibold" 
                    min="2000"
                    placeholder="2000"
                  />
                  <p className="text-xs text-eth-grey">Minimum: 2,000 XLM • No maximum limit</p>
                </div>

                <div className="bg-pro-dark rounded-lg p-4 border border-stellar-cyan/30">
                  <p className="text-sm font-medium text-white mb-2">Liquidity Pool Preview</p>
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-xs text-eth-grey mb-1">XLM</p>
                      <p className="text-lg font-bold text-stellar-cyan">
                        {parseInt(formData.initialLiquidityXLM || '0').toLocaleString()}
                      </p>
                    </div>
                    <div className="text-2xl text-eth-grey">⇄</div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-eth-grey mb-1">{formData.tokenSymbol || 'TOKEN'}</p>
                      <p className="text-lg font-bold text-bitcoin-orange">
                        {getLiquidityTokens().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-pro-dark-lighter p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-bitcoin-orange" />
                  Vesting & Lockup (Optional)
                </h3>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.vestingEnabled}
                      onChange={(e) => setFormData({...formData, vestingEnabled: e.target.checked})}
                      className="w-5 h-5 rounded border-white/20 bg-pro-dark text-bitcoin-orange focus:ring-2 focus:ring-bitcoin-orange"
                    />
                    <span className="text-sm font-medium text-white">Enable vesting for creator allocation</span>
                  </label>

                  {formData.vestingEnabled && (
                    <div className="ml-8 space-y-2">
                      <label className="block text-sm font-medium text-eth-grey-medium">
                        Vesting Period (months)
                      </label>
                      <input 
                        type="number" 
                        value={formData.vestingMonths} 
                        onChange={(e) => setFormData({...formData, vestingMonths: e.target.value})} 
                        className="w-full bg-pro-dark border border-white/10 rounded-lg px-4 py-3 text-white placeholder-eth-grey focus:outline-none focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent" 
                        min="1"
                        max="48"
                        placeholder="12"
                      />
                      <p className="text-xs text-eth-grey">
                        Your {getAllocation().creator}% allocation will unlock gradually over {formData.vestingMonths} months
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Event & Launch</h2>
                <p className="text-eth-grey">Set your event duration and confirm launch</p>
              </div>

              {isCreating && creationStatus && (
                <div className="bg-gradient-to-r from-stellar-cyan/20 to-bitcoin-orange/20 border-2 border-stellar-cyan/50 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <Loader2 className="w-8 h-8 text-stellar-cyan animate-spin flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-white mb-1">Processing...</p>
                      <p className="text-sm text-eth-grey-medium">{creationStatus}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-pro-dark-lighter p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-stellar-cyan" />
                  Event Duration
                </h3>

                <div className="space-y-2 mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-eth-grey-medium">
                    Duration (days) *
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-eth-grey cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-pro-dark border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-10">
                        Time for users to join and earn entries. Min 3 days, max 7 days. DEX launches automatically when event ends.
                      </div>
                    </div>
                  </label>
                  <input 
                    type="number" 
                    value={formData.eventDurationDays} 
                    onChange={(e) => setFormData({...formData, eventDurationDays: e.target.value})} 
                    className="w-full bg-pro-dark border border-white/10 rounded-lg px-4 py-3 text-white placeholder-eth-grey focus:outline-none focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent text-lg font-semibold" 
                    min="3"
                    max="7"
                    placeholder="7"
                  />
                  <p className="text-xs text-eth-grey">Minimum: 3 days • Maximum: 7 days</p>
                </div>

                <div className="bg-gradient-to-r from-stellar-cyan/10 to-bitcoin-orange/10 rounded-xl p-6 border border-stellar-cyan/30">
                  <p className="text-sm font-semibold text-white mb-4">What happens during the event?</p>
                  <ul className="space-y-3 text-sm text-eth-grey-medium">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-stellar-cyan flex-shrink-0 mt-0.5" />
                      <span>Users join the airdrop and receive unique referral links</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-stellar-cyan flex-shrink-0 mt-0.5" />
                      <span>Each participant earns entries and gets referral rewards for bringing others</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-stellar-cyan flex-shrink-0 mt-0.5" />
                      <span>When event ends: DEX auto-launches & airdrop tokens become claimable</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-stellar-cyan flex-shrink-0 mt-0.5" />
                      <span>Airdrop distribution based on total entries and referral ranking</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-pro-dark-lighter p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-5">Launch Summary</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-eth-grey mb-1">Token</p>
                      <p className="text-lg font-bold text-white">
                        {formData.tokenName || 'Not set'} ({formData.tokenSymbol || 'N/A'})
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-eth-grey mb-1">Total Supply</p>
                      <p className="text-lg font-bold text-white">
                        {parseInt(formData.totalSupply || '0').toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-eth-grey mb-1">Event Duration</p>
                      <p className="text-lg font-bold text-stellar-cyan">
                        {formData.eventDurationDays} days
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-eth-grey mb-1">Airdrop Pool</p>
                      <p className="text-lg font-bold text-stellar-cyan">
                        {formData.airdropPercent}% ({getAirdropTokens().toLocaleString()})
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-eth-grey mb-1">Liquidity Pool</p>
                      <p className="text-lg font-bold text-bitcoin-orange">
                        {formData.liquidityPercent}% ({getLiquidityTokens().toLocaleString()})
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-eth-grey mb-1">Your Allocation</p>
                      <p className="text-lg font-bold text-white">
                        {getAllocation().creator}% ({getCreatorTokens().toLocaleString()})
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-eth-grey">Required Liquidity</p>
                    <p className="text-xl font-bold text-stellar-cyan">
                      {parseInt(formData.initialLiquidityXLM || '0').toLocaleString()} XLM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/10">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-8 py-3 bg-pro-dark-lighter hover:bg-pro-dark text-white rounded-xl font-semibold transition-all hover:scale-105"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="ml-auto flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-bitcoin-orange to-bitcoin-orange-light hover:from-bitcoin-orange-light hover:to-bitcoin-orange text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-bitcoin-orange/30"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isCreating}
                className={`ml-auto flex items-center gap-2 px-12 py-4 bg-gradient-to-r from-stellar-cyan to-bitcoin-orange text-white rounded-xl font-bold text-lg transition-all shadow-2xl shadow-stellar-cyan/40 ${
                  isCreating
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:from-stellar-cyan/90 hover:to-bitcoin-orange/90 hover:scale-105'
                }`}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Rocket className="w-6 h-6" />
                    {connected ? 'Launch Token' : 'Connect Wallet to Launch'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
