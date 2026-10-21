/**
 * Caso de uso: buscar o catálogo de produtos.
 * Recebe o repositório por parâmetro, sem saber se os dados vêm de mock ou de API.
 */
export function makeGetProducts(productRepository) {
  return function getProducts() {
    return productRepository.getAll()
  }
}
