export function validateAllocation(airdrop: number, liquidity: number): {
  valid: boolean
  total: number
  creator: number
  error?: string
} {
  const total = airdrop + liquidity
  const creator = 100 - total
  
  if (airdrop < 0 || liquidity < 0) {
    return {
      valid: false,
      total,
      creator,
      error: 'All percentages must be positive'
    }
  }
  
  if (total > 100) {
    return {
      valid: false,
      total,
      creator,
      error: `Airdrop + Liquidity cannot exceed 100% (currently ${total}%)`
    }
  }
  
  if (airdrop < 10) {
    return {
      valid: false,
      total,
      creator,
      error: 'Airdrop allocation must be at least 10%'
    }
  }
  
  if (liquidity < 10) {
    return {
      valid: false,
      total,
      creator,
      error: 'Liquidity allocation must be at least 10%'
    }
  }
  
  return { valid: true, total, creator }
}

export function validateLiquidityXLM(xlmAmount: number): {
  valid: boolean
  error?: string
} {
  const MIN_LIQUIDITY = 2000
  
  if (xlmAmount < MIN_LIQUIDITY) {
    return {
      valid: false,
      error: `Minimum liquidity required: ${MIN_LIQUIDITY.toLocaleString()} XLM`
    }
  }
  
  return { valid: true }
}

export function validateEventDuration(days: number): {
  valid: boolean
  error?: string
} {
  if (days < 3) {
    return {
      valid: false,
      error: 'Event duration must be at least 3 days'
    }
  }
  
  if (days > 7) {
    return {
      valid: false,
      error: 'Event duration cannot exceed 7 days'
    }
  }
  
  return { valid: true }
}

export function calculateDynamicPrice(
  basePrice: number,
  creatorAllocation: number,
  _totalSupply: number,
  maxParticipants: number,
  currentParticipants: number
): number {
  const allocationMultiplier = 1 + (creatorAllocation / 100) * 0.5
  const demandMultiplier = currentParticipants / maxParticipants
  return basePrice * allocationMultiplier * (1 + demandMultiplier * 0.3)
}

export function calculateParticipantShare(
  airdropPercent: number,
  supply: number,
  maxParticipants: number
): number {
  const airdropPool = (supply * airdropPercent) / 100
  return airdropPool / maxParticipants
}

export function calculateReferralBonus(
  baseReward: number,
  referralPercent: number,
  referralCount: number
): number {
  const tierMultiplier = Math.min(1 + referralCount * 0.1, 2)
  return baseReward * (referralPercent / 100) * tierMultiplier
}
