import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export const useAssets = (limit?: number) => {
  return useQuery({
    queryKey: ['assets', limit],
    queryFn: () => api.getAssets(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })
}

export const useAssetSearch = (query: string) => {
  return useQuery({
    queryKey: ['assets', 'search', query],
    queryFn: () => api.searchAssets(query),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000,
  })
}

export const useAssetDetails = (code: string, issuer: string) => {
  return useQuery({
    queryKey: ['asset', code, issuer],
    queryFn: () => api.getAssetDetails(code, issuer),
    enabled: !!code && !!issuer,
    staleTime: 5 * 60 * 1000,
  })
}
