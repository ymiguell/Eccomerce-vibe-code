import { useCallback } from 'react'
import { useAsyncData } from './useAsyncData.js'

/** Produtos de um nicho da loja, ex.: useProductsByNiche(getProductsByNiche, 'moda'). */
export function useProductsByNiche(getProductsByNiche, niche) {
  const loadProducts = useCallback(() => getProductsByNiche(niche), [getProductsByNiche, niche])
  return useAsyncData(loadProducts)
}
