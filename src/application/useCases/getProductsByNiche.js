/**
 * Caso de uso: buscar os produtos de um nicho da loja (ex.: getProductsByNiche('moda')).
 * Recebe o repositório por parâmetro, sem saber se os dados vêm de mock ou de API.
 */
export function makeGetProductsByNiche(productRepository) {
  return function getProductsByNiche(niche) {
    return productRepository.getByNiche(niche)
  }
}
