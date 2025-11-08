export const FALLBACK_LOGOS: Record<string, string> = {
  'XLM': 'https://cryptologos.cc/logos/stellar-xlm-logo.png',
  'USDC': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  'AQUA': 'https://aqua.network/assets/img/aqua-logo.png',
}

export const TOKEN_COLORS: Record<string, { from: string; to: string }> = {
  'XLM': { from: '#000000', to: '#141414' },
  'USDC': { from: '#2775CA', to: '#1E5FA4' },
  'USDT': { from: '#26A17B', to: '#1D7A5D' },
  'AQUA': { from: '#00C2FF', to: '#0091CC' },
  'yUSDC': { from: '#7B3FE4', to: '#5A2DB0' },
  'BTC': { from: '#F7931A', to: '#C87315' },
  'ETH': { from: '#627EEA', to: '#4A5FB8' },
  'yXLM': { from: '#FCD535', to: '#D4B327' },
}

export function getAssetLogoUrl(assetCode: string, imageUrl?: string): string | null {
  if (imageUrl) return imageUrl
  return FALLBACK_LOGOS[assetCode] || null
}

export function getTokenColor(assetCode: string): { from: string; to: string } {
  return TOKEN_COLORS[assetCode] || { from: '#FCD535', to: '#F7931A' }
}

export function getAssetInitials(assetCode: string): string {
  return assetCode.substring(0, 3).toUpperCase()
}
