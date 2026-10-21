/**
 * Produto da loja. Entidade pura: não conhece React, API nem estilos.
 * - `niche`: área da loja ('moda', 'casa'...). Cada página de nicho lista os seus.
 * - `originalPrice`: opcional; indica que o produto está em promoção.
 * - `sizes`, `colors`, `fabric`, `stock`: usados pelos filtros da listagem.
 * - `imageUrl`: foto do produto; sem ela, o card mostra um espaço reservado.
 */
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
  imageUrl = null,
}) {
  if (!id || !name || !niche || !category) {
    throw new Error('Produto inválido: id, name, niche e category são obrigatórios')
  }

  if (typeof price !== 'number' || price < 0) {
    throw new Error(`Produto inválido: preço deve ser um número positivo (${id})`)
  }

  if (originalPrice !== null && (typeof originalPrice !== 'number' || originalPrice <= price)) {
    throw new Error(`Produto inválido: originalPrice deve ser maior que price (${id})`)
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
    imageUrl,
  })
}

/** Percentual de desconto arredondado, ou 0 se o produto não está em promoção. */
export function getDiscountPercent(product) {
  if (!product.originalPrice) return 0
  return Math.round((1 - product.price / product.originalPrice) * 100)
}

/** Produto em promoção: tem preço original maior que o preço atual. */
export function isOnSale(product) {
  return getDiscountPercent(product) > 0
}

export function isInStock(product) {
  return product.stock > 0
}

// Abaixo disso a página do produto avisa "Últimas unidades"
export const LOW_STOCK_THRESHOLD = 5

export function isLowStock(product) {
  return isInStock(product) && product.stock <= LOW_STOCK_THRESHOLD
}
