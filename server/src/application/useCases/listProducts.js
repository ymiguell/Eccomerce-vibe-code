/**
 * Caso de uso: listar o catálogo, com filtros opcionais.
 * - `niche`: só os produtos de uma área (ex.: 'moda').
 * - `featured`: só os destaques da Home.
 * - `onSale`: só os em promoção (Outlet).
 * Recebe o repositório por parâmetro, sem saber se os dados vêm do PostgreSQL ou de outro lugar.
 */
export function makeListProducts(productRepository) {
  return function listProducts({ niche = null, featured = false, onSale = false } = {}) {
    return productRepository.findMany({ niche, featured, onSale })
  }
}
