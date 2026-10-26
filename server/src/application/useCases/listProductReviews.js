/** Caso de uso: avaliações de um produto, das mais recentes para as mais antigas. */
export function makeListProductReviews(reviewRepository) {
  return function listProductReviews(productId) {
    return reviewRepository.findByProduct(productId)
  }
}
