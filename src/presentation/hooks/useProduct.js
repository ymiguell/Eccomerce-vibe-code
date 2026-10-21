import { useEffect, useState } from 'react'

/**
 * Carrega um produto pelo id.
 * Diferencia "carregando" de "não encontrado" (product = null) — importante para a página do produto.
 */
export function useProduct(getProductById, productId) {
  // Guarda de qual id é o resultado, para não mostrar o produto anterior ao navegar entre produtos
  const [state, setState] = useState({ productId: null, product: null })

  useEffect(() => {
    let active = true

    getProductById(productId).then((product) => {
      if (active) setState({ productId, product })
    })

    return () => {
      active = false
    }
  }, [getProductById, productId])

  const loading = state.productId !== productId
  return { loading, product: loading ? null : state.product }
}
