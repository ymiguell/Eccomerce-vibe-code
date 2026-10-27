// Áreas da loja; cada uma tem sua página (/moda, /casa...)
export const NICHES = Object.freeze(['moda', 'casa', 'tecnologia', 'saude'])

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

// Teto de segurança para preços digitados no painel (evita um zero a mais virar R$ 1 milhão)
export const MAX_PRICE = 100_000

/**
 * Confere preço, preço original (promoção) e estoque editados no painel. Mesma regra do servidor.
 * Retorna { campo: mensagem } — vazio quando está tudo certo.
 */
export function validateProductChanges({ price, originalPrice, stock }) {
  const errors = {}

  if (!Number.isFinite(price) || price <= 0 || price > MAX_PRICE) {
    errors.price = 'Informe um preço maior que zero.'
  } else if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice <= price || originalPrice > MAX_PRICE)) {
    errors.originalPrice = 'O preço original precisa ser maior que o preço.'
  }

  if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Informe um estoque inteiro, zero ou mais.'

  return errors
}

// Limites do cadastro de produto novo no painel (os mesmos do servidor)
export const PRODUCT_LIMITS = Object.freeze({ name: 120, category: 60, description: 2000, fabric: 60, option: 20, options: 20 })

/**
 * Confere um produto novo do painel (textos já sem espaços sobrando; listas sem itens vazios).
 * `hasPhoto`: se a foto foi escolhida. Mesma regra do servidor.
 * Retorna { campo: mensagem } — vazio quando está tudo certo.
 */
export function validateNewProduct({ name, niche, category, description, sizes, colors, fabric, price, originalPrice, stock, hasPhoto }) {
  const errors = validateProductChanges({ price, originalPrice, stock })
  const tooLong = (text, max) => text.length > max

  if (name.length < 3) errors.name = 'Informe o nome do produto.'
  else if (tooLong(name, PRODUCT_LIMITS.name)) errors.name = `Use no máximo ${PRODUCT_LIMITS.name} caracteres.`
  if (!NICHES.includes(niche)) errors.niche = 'Escolha a área da loja.'
  if (category.length < 2) errors.category = 'Informe a categoria (ex.: Camisetas).'
  else if (tooLong(category, PRODUCT_LIMITS.category)) errors.category = `Use no máximo ${PRODUCT_LIMITS.category} caracteres.`
  if (tooLong(description, PRODUCT_LIMITS.description)) errors.description = `Use no máximo ${PRODUCT_LIMITS.description} caracteres.`
  if (tooLong(fabric, PRODUCT_LIMITS.fabric)) errors.fabric = `Use no máximo ${PRODUCT_LIMITS.fabric} caracteres.`

  for (const [field, list] of [['sizes', sizes], ['colors', colors]]) {
    if (list.length > PRODUCT_LIMITS.options || list.some((item) => tooLong(item, PRODUCT_LIMITS.option))) {
      errors[field] = `Até ${PRODUCT_LIMITS.options} opções, cada uma com até ${PRODUCT_LIMITS.option} caracteres.`
    }
  }
  if (!hasPhoto) errors.photo = 'Escolha a foto do produto.'

  return errors
}

// Foto escolhida no painel, antes de ser reduzida para o envio
export const PHOTO_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp'])
export const MAX_PHOTO_BYTES = 20 * 1024 * 1024

/** Confere o arquivo escolhido. Retorna a mensagem de erro, ou null se está certo. */
export function validatePhotoFile({ type, size }) {
  if (!PHOTO_TYPES.includes(type)) return 'Escolha uma foto em JPG, PNG ou WebP.'
  if (size > MAX_PHOTO_BYTES) return 'A foto passa de 20 MB. Escolha uma menor.'
  return null
}
