import { useState } from 'react'

/**
 * Mostra a lista aos poucos: `pageSize` itens por vez, mais `pageSize` a cada loadMore().
 * Quando a lista muda (ex.: filtro aplicado), volta a mostrar só a primeira leva.
 */
export function useLoadMore(items, pageSize) {
  const listKey = items.map((item) => item.id).join(',')
  const [state, setState] = useState({ listKey, count: pageSize })

  // Lista mudou (filtro, ordenação): recomeça do início. Ajustar o estado durante o render,
  // em vez de num efeito, evita um render extra mostrando a quantidade antiga.
  if (state.listKey !== listKey) setState({ listKey, count: pageSize })
  const count = state.listKey === listKey ? state.count : pageSize

  return {
    visibleItems: items.slice(0, count),
    shownCount: Math.min(count, items.length),
    total: items.length,
    hasMore: count < items.length,
    loadMore: () => setState({ listKey, count: count + pageSize }),
  }
}
