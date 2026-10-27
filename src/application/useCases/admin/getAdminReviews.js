/**
 * Caso de uso (painel): uma página de avaliações de todos os produtos, mais recentes primeiro.
 * `visibility`: 'visible' | 'hidden' | null (todas). Retorna { reviews, total, page, pageSize, counts }.
 */
export function makeGetAdminReviews(adminRepository) {
  return function getAdminReviews({ visibility = null, page = 1 } = {}) {
    return adminRepository.listReviews({ visibility, page })
  }
}
