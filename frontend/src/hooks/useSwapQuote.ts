import { useQuery } from '@tanstack/react-query'
import { api, SwapQuoteParams } from '../api/client'

export const useSwapQuote = (
  fromAssetCode: string,
  fromAssetIssuer: string,
  toAssetCode: string,
  toAssetIssuer: string,
  amount: string,
  mode: 'send' | 'receive' = 'send'
) => {
  return useQuery({
    queryKey: ['swapQuote', fromAssetCode, fromAssetIssuer, toAssetCode, toAssetIssuer, amount, mode],
    queryFn: () => {
      const params: SwapQuoteParams = {
        fromAssetCode,
        fromAssetIssuer,
        toAssetCode,
        toAssetIssuer,
        amount,
        mode,
      }
      return api.getSwapQuote(params)
    },
    enabled: !!fromAssetCode && !!fromAssetIssuer && !!toAssetCode && !!toAssetIssuer && !!amount && parseFloat(amount) > 0,
    staleTime: 10 * 1000,
    gcTime: 30 * 1000,
    retry: 1,
    refetchInterval: 15000,
  })
}
