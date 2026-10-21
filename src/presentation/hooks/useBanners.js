import { useCallback } from 'react'
import { useAsyncData } from './useAsyncData.js'

/** Banners de uma página específica, ex.: useBanners(getBanners, 'moda'). */
export function useBanners(getBanners, placement) {
  const loadBanners = useCallback(() => getBanners(placement), [getBanners, placement])
  return useAsyncData(loadBanners)
}
