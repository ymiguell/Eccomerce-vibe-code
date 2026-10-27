/**
 * Produto da loja. Entidade pura: não conhece banco, Fastify nem HTTP.
 * Mesmas regras do front (src/domain/entities/Product.js); aqui elas valem para o que entra e sai da API.
 * - `niche`: área da loja (ver NICHES).
 * - `originalPrice`: opcional; indica que o produto está em promoção.
 * - `image`: nome do arquivo de uma foto que fica no site, ou endereço (URL) de uma foto enviada pelo painel.
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

// Teto de segurança para preços digitados no painel (evita um zero a mais virar R$ 1 milhão)
export const MAX_PRICE = 100_000

/**
 * Confere preço, preço original (promoção) e estoque editados no painel.
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

// Limites do cadastro de produto novo no painel
export const PRODUCT_LIMITS = Object.freeze({ name: 120, category: 60, description: 2000, fabric: 60, option: 20, options: 20 })

/**
 * Confere um produto novo cadastrado no painel (textos já sem espaços sobrando; listas sem itens vazios).
 * Retorna { campo: mensagem } — vazio quando está tudo certo.
 */
export function validateNewProduct({ name, niche, category, description, sizes, colors, fabric, price, originalPrice, stock, image }) {
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
  if (!image) errors.image = 'Escolha a foto do produto.'

  return errors
}

/** Endereço do produto a partir do nome: "Camiseta Básica Algodão" → "camiseta-basica-algodao". */
export function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')
}

// Fotos enviadas pelo painel: JPG, PNG ou WebP de até 5 MB
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/**
 * Tipo da imagem pelos primeiros bytes do arquivo (não pelo nome nem pelo que o navegador diz).
 * Retorna 'jpg', 'png', 'webp' ou null se não é uma dessas imagens.
 */
export function detectImageType(bytes) {
  const startsWith = (signature, offset = 0) => signature.every((byte, index) => bytes[offset + index] === byte)
  if (startsWith([0xff, 0xd8, 0xff])) return 'jpg'
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png'
  // "RIFF" .... "WEBP"
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return 'webp'
  return null
}

/** Produto em promoção: tem preço original maior que o preço atual. */
export function isOnSale(product) {
  return product.originalPrice !== null && product.originalPrice > product.price
}

export function isInStock(product) {
  return product.stock > 0
}
