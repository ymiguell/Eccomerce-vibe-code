/**
 * Caso de uso: buscar os produtos em destaque da página principal.
 * Recebe o repositório por parâmetro, sem saber se os dados vêm de mock ou de API.
 */
export function makeGetFeaturedProducts(productRepository) {
  return function getFeaturedProducts() {
    return productRepository.getFeatured()
  }
}
