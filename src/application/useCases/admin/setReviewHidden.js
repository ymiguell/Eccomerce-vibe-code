/** Caso de uso (painel): ocultar uma avaliação da loja ou mostrar de novo. Retorna { review } ou { error }. */
export function makeSetReviewHidden(adminRepository) {
  return function setReviewHidden(reviewId, hidden) {
    return adminRepository.setReviewHidden(reviewId, hidden)
  }
}
