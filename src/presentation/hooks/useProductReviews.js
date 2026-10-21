import { useEffect, useState } from 'react'
import { summarizeRatings } from '../../domain/entities/Review.js'

/** Avaliações de um produto + resumo das notas + envio de uma nova avaliação. */
export function useProductReviews(getProductReviews, submitReview, productId) {
  // Guarda de qual produto são as avaliações, para não mostrar as do produto anterior ao navegar
  const [state, setState] = useState({ productId: null, reviews: [] })

  useEffect(() => {
    let active = true

    getProductReviews(productId).then((reviews) => {
      if (active) setState({ productId, reviews })
    })

    return () => {
      active = false
    }
  }, [getProductReviews, productId])

  const loading = state.productId !== productId
  const reviews = loading ? [] : state.reviews

  // Retorna { review } ou { errors }; quando dá certo, a avaliação nova aparece no topo da lista
  const submit = async (input) => {
    const result = await submitReview(productId, input)
    if (result.review) setState((current) => ({ productId, reviews: [result.review, ...current.reviews] }))
    return result
  }

  return { loading, reviews, summary: summarizeRatings(reviews), submit }
}
