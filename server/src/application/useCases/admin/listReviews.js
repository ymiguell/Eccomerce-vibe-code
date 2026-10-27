export const REVIEWS_PAGE_SIZE = 20

/**
 * Caso de uso (painel): uma página de avaliações de todos os produtos (mais recentes primeiro).
 * `visibility`: 'visible' | 'hidden' | null (todas). Vem junto quantas há de cada tipo.
 */
export function makeListReviews(reviewRepository) {
  return async function listReviews({ visibility = null, page = 1 } = {}) {
    const hidden = visibility === null ? null : visibility === 'hidden'
    const [{ reviews, total }, counts] = await Promise.all([
      reviewRepository.findPage({ hidden, page, pageSize: REVIEWS_PAGE_SIZE }),
      reviewRepository.countByVisibility(),
    ])
    return { reviews, total, page, pageSize: REVIEWS_PAGE_SIZE, counts }
  }
}
