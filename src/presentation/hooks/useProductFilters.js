import { useMemo, useState } from 'react'
import {
  EMPTY_FILTERS,
  countActiveFilters,
  filterProducts,
  getFilterOptions,
  sortProducts,
} from '../../domain/services/productCatalog.js'

/**
 * Estado dos filtros e da ordenação de uma listagem. As regras ficam no domínio.
 * `initialSort`: ordenação inicial (ex.: 'discount' no Outlet). Ver SORT_OPTIONS.
 */
export function useProductFilters(products, initialSort = 'relevance') {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [sortBy, setSortBy] = useState(initialSort)

  const options = useMemo(() => getFilterOptions(products), [products])
  // useMemo mantém a mesma lista entre renders, evitando que o carrossel volte ao início sem motivo
  const visibleProducts = useMemo(
    () => sortProducts(filterProducts(products, filters), sortBy),
    [products, filters, sortBy],
  )

  // Marca/desmarca um valor em um filtro de lista (ex.: toggleValue('colors', 'Azul'))
  const toggleValue = (key, value) =>
    setFilters((current) => ({
      ...current,
      [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value],
    }))

  return {
    filters,
    options,
    sortBy,
    setSortBy,
    visibleProducts,
    activeCount: countActiveFilters(filters),
    toggleValue,
    setOnlyInStock: (onlyInStock) => setFilters((current) => ({ ...current, onlyInStock })),
    clearFilters: () => setFilters(EMPTY_FILTERS),
  }
}
