/**
 * Caso de uso: buscar um produto pelo id (página do produto).
 * Retorna null quando o produto não existe.
 */
export function makeGetProduct(productRepository) {
  return function getProduct(id) {
    return productRepository.findById(id)
  }
}
