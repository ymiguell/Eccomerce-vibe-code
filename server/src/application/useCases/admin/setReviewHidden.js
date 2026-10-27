/**
 * Caso de uso (painel): ocultar uma avaliação da loja (ofensa, propaganda, dados pessoais...) ou mostrar de novo.
 * Não apaga: dá para voltar atrás. Retorna { review } ou { error: 'review_not_found' }.
 */
export function makeSetReviewHidden(reviewRepository) {
  return async function setReviewHidden(reviewId, hidden) {
    const review = await reviewRepository.setHidden(reviewId, hidden)
    return review ? { review } : { error: 'review_not_found' }
  }
}
