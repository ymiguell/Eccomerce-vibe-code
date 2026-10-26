/**
 * Produto da loja. Entidade pura: não conhece banco, Fastify nem HTTP.
 * Mesmas regras do front (src/domain/entities/Product.js); aqui elas valem para o que entra e sai da API.
 * - `niche`: área da loja (ver NICHES).
 * - `originalPrice`: opcional; indica que o produto está em promoção.
 * - `image`: nome do arquivo da foto (as fotos ficam no site por enquanto).
 */
export const NICHES = Object.freeze(['moda', 'casa', 'tecnologia', 'saude'])

export function createProduct({
  id,
  name,
  niche,
  category,
  description = '',
  price,
  originalPrice = null,
  isFeatured = false,
  sizes = [],
  colors = [],
  fabric = '',
  stock = 0,
  image = null,
}) {
  if (!id || !name || !NICHES.includes(niche) || !category) {
    throw new Error(`Produto inválido: id, name, niche e category são obrigatórios (${id})`)
  }

  if (typeof price !== 'number' || price < 0) {
    throw new Error(`Produto inválido: preço deve ser um número positivo (${id})`)
  }

  if (originalPrice !== null && (typeof originalPrice !== 'number' || originalPrice <= price)) {
    throw new Error(`Produto inválido: originalPrice deve ser maior que price (${id})`)
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error(`Produto inválido: estoque deve ser um inteiro maior ou igual a zero (${id})`)
  }

  return Object.freeze({
    id,
    name,
    niche,
    category,
    description,
    price,
    originalPrice,
    isFeatured,
    sizes: Object.freeze([...sizes]),
    colors: Object.freeze([...colors]),
    fabric,
    stock,
    image,
  })
}

/** Produto em promoção: tem preço original maior que o preço atual. */
export function isOnSale(product) {
  return product.originalPrice !== null && product.originalPrice > product.price
}

export function isInStock(product) {
  return product.stock > 0
}
