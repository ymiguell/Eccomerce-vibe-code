/**
 * Caso de uso: buscar um produto pelo id (página do produto).
 * Retorna null quando o produto não existe.
 */
export function makeGetProductById(productRepository) {
  return function getProductById(productId) {
    return productRepository.getById(productId)
  }
}
