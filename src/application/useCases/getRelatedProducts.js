import { getRelatedProducts as pickRelated } from '../../domain/services/productCatalog.js'

/**
 * Caso de uso: produtos relacionados ao que está sendo visto ("Você também pode gostar").
 * A regra de quais são parecidos fica no domínio.
 */
export function makeGetRelatedProducts(productRepository) {
  return async function getRelatedProducts(product, limit = 4) {
    const products = await productRepository.getAll()
    return pickRelated(product, products, limit)
  }
}
