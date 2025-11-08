import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export const usePools = (limit?: number) => {
  return useQuery({
    queryKey: ['pools', limit],
    queryFn: () => api.getPools(limit),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })
}

export const usePoolDetails = (poolId: string) => {
  return useQuery({
    queryKey: ['pool', poolId],
    queryFn: () => api.getPoolDetails(poolId),
    enabled: !!poolId,
    staleTime: 2 * 60 * 1000,
  })
}

export const usePoolsForAsset = (assetCode: string, assetIssuer: string) => {
  return useQuery({
    queryKey: ['pools', 'asset', assetCode, assetIssuer],
    queryFn: () => api.getPoolsForAsset(assetCode, assetIssuer),
    enabled: !!assetCode && !!assetIssuer,
    staleTime: 2 * 60 * 1000,
  })
}
