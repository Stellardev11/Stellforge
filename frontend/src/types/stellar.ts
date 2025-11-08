export interface StellarAsset {
  asset_code?: string
  asset_issuer?: string
  asset_type: string
  domain?: string
  image?: string
  verified?: boolean
  num_accounts?: number
  amount?: string
  flags?: {
    auth_required: boolean
    auth_revocable: boolean
    auth_immutable: boolean
  }
  toml_info?: {
    image?: string
    name?: string
    desc?: string
    verified?: boolean
  }
}

export interface SwapQuote {
  source_asset_code: string
  source_asset_issuer: string
  source_amount: string
  destination_asset_code: string
  destination_asset_issuer: string
  destination_amount: string
  path: Array<{
    asset_code: string
    asset_issuer: string
    asset_type: string
  }>
  source_asset_estimate?: string
}

export interface LiquidityPool {
  id: string
  paging_token: string
  fee_bp: number
  type: string
  total_trustlines: string
  total_shares: string
  reserves: Array<{
    asset: string
    amount: string
  }>
  last_modified_ledger: number
  last_modified_time: string
}

export interface PoolDetails extends LiquidityPool {
  total_value_locked?: number
  apr?: number
  volume_24h?: number
}

export interface AccountBalance {
  balance: string
  asset_type: string
  asset_code?: string
  asset_issuer?: string
  limit?: string
  buying_liabilities?: string
  selling_liabilities?: string
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
}
