/**
 * Caso de uso: avaliações de um produto, das mais recentes para as mais antigas.
 */
export function makeGetProductReviews(reviewRepository) {
  return async function getProductReviews(productId) {
    const reviews = await reviewRepository.getByProduct(productId)
    return [...reviews].sort((a, b) => b.date.localeCompare(a.date))
  }
}
