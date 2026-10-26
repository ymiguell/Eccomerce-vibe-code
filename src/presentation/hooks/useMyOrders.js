import { useEffect, useState } from 'react'

/** Pedidos da conta logada. status: 'loading' | 'ready' | 'failed' (ex.: servidor fora do ar). */
export function useMyOrders(getMyOrders) {
  const [state, setState] = useState({ status: 'loading', orders: [] })

  useEffect(() => {
    let active = true

    getMyOrders()
      .then((orders) => {
        if (active) setState({ status: 'ready', orders })
      })
      .catch((error) => {
        console.error('Falha ao carregar pedidos:', error)
        if (active) setState({ status: 'failed', orders: [] })
      })

    return () => {
      active = false
    }
  }, [getMyOrders])

  return state
}
