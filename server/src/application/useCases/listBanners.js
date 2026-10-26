/**
 * Caso de uso: banners do carrossel de uma página (os dela + os que aparecem em todas), na ordem de exibição.
 */
export function makeListBanners(bannerRepository) {
  return function listBanners(placement) {
    return bannerRepository.findByPlacement(placement)
  }
}
