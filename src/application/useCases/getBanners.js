/**
 * Caso de uso: buscar os banners de uma página (ex.: getBanners('moda')).
 * Recebe o repositório por parâmetro, sem saber se os dados vêm de mock ou de API.
 */
export function makeGetBanners(bannerRepository) {
  return function getBanners(placement) {
    return bannerRepository.getByPlacement(placement)
  }
}
