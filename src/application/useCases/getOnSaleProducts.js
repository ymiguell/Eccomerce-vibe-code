import { isOnSale } from '../../domain/entities/Product.js'

/**
 * Caso de uso: buscar todos os produtos em promoção, de todos os nichos (página Outlet).
 * Recebe o repositório por parâmetro, sem saber se os dados vêm de mock ou de API.
 */
export function makeGetOnSaleProducts(productRepository) {
  return async function getOnSaleProducts() {
    const products = await productRepository.getAll()
    return products.filter(isOnSale)
  }
}
