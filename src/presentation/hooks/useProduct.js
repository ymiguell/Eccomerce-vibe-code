import { useEffect, useState } from 'react'

/**
 * Carrega um produto pelo id.
 * Diferencia "carregando", "não encontrado" (product = null) e "falhou" (failed = true, ex.: API fora do ar).
 */
export function useProduct(getProductById, productId) {
  // Guarda de qual id é o resultado, para não mostrar o produto anterior ao navegar entre produtos
  const [state, setState] = useState({ productId: null, product: null, failed: false })

  useEffect(() => {
    let active = true

    getProductById(productId)
      .then((product) => {
        if (active) setState({ productId, product, failed: false })
      })
      .catch((error) => {
        console.error('Falha ao carregar o produto:', error)
        if (active) setState({ productId, product: null, failed: true })
      })

    return () => {
      active = false
    }
  }, [getProductById, productId])

  const loading = state.productId !== productId
  return { loading, product: loading ? null : state.product, failed: !loading && state.failed }
}
