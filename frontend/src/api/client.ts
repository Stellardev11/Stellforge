const API_BASE = '/api';

export interface SwapQuoteParams {
  fromAssetCode: string
  fromAssetIssuer: string
  toAssetCode: string
  toAssetIssuer: string
  amount: string
  mode?: 'send' | 'receive'
}

export const api = {
  getAssets: async (limit?: number) => {
    const url = `${API_BASE}/dex/assets${limit ? `?limit=${limit}` : ''}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch assets')
    }
    return response.json()
  },

  searchAssets: async (query: string) => {
    if (!query) return { success: true, assets: [] }
    const url = `${API_BASE}/dex/assets/search?q=${encodeURIComponent(query)}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to search assets')
    }
    return response.json()
  },

  getAssetDetails: async (code: string, issuer: string) => {
    const url = `${API_BASE}/dex/assets/${code}/${issuer}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch asset details')
    }
    return response.json()
  },

  getSwapQuote: async (params: SwapQuoteParams) => {
    const { fromAssetCode, fromAssetIssuer, toAssetCode, toAssetIssuer, amount, mode = 'send' } = params
    const queryParams = new URLSearchParams({
      fromAssetCode,
      fromAssetIssuer,
      toAssetCode,
      toAssetIssuer,
      amount,
      mode,
    })
    const url = `${API_BASE}/dex/quote?${queryParams}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to get swap quote')
    }
    return response.json()
  },

  submitTransaction: async (xdr: string) => {
    const url = `${API_BASE}/dex/submit`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ xdr }),
    })
    if (!response.ok) {
      throw new Error('Failed to submit transaction')
    }
    return response.json()
  },

  getTransactionStatus: async (hash: string) => {
    const url = `${API_BASE}/dex/transaction/${hash}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to get transaction status')
    }
    return response.json()
  },

  getPools: async (limit?: number) => {
    const url = `${API_BASE}/liquidity/pools${limit ? `?limit=${limit}` : ''}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch liquidity pools')
    }
    return response.json()
  },

  getPoolDetails: async (id: string) => {
    const url = `${API_BASE}/liquidity/pools/${id}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch pool details')
    }
    return response.json()
  },

  getPoolsForAsset: async (assetCode: string, assetIssuer: string) => {
    const url = `${API_BASE}/liquidity/pools/for-asset/${assetCode}/${assetIssuer}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch pools for asset')
    }
    return response.json()
  },

  calculateLPShares: async (poolId: string, tokenAAmount: string, tokenBAmount: string) => {
    const url = `${API_BASE}/liquidity/calculate-shares`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ poolId, tokenAAmount, tokenBAmount }),
    })
    if (!response.ok) {
      throw new Error('Failed to calculate LP shares')
    }
    return response.json()
  },

  getActiveProjects: async () => {
    const url = `${API_BASE}/projects/active`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch active projects')
    }
    return response.json()
  },

  getProject: async (projectId: string) => {
    const url = `${API_BASE}/projects/${projectId}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch project')
    }
    return response.json()
  },

  getProjectStats: async (projectId: string) => {
    const url = `${API_BASE}/star-burn/project/${projectId}/stats`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch project stats')
    }
    return response.json()
  },
}
