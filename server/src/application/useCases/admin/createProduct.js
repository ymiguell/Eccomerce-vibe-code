import { roundMoney } from '../../../domain/entities/Coupon.js'
import { slugify, validateNewProduct } from '../../../domain/entities/Product.js'

const clean = (text = '') => text.trim().replace(/\s+/g, ' ')
// Opções (tamanhos, cores) sem espaços sobrando, sem vazias e sem repetidas
const cleanList = (list = []) => [...new Set(list.map(clean).filter(Boolean))]

/**
 * Caso de uso (painel): cadastrar um produto novo, com a foto já enviada (uploadProductImage).
 * O endereço do produto vem do nome; se já existir, ganha -2, -3...
 * Retorna { product } ou { error: 'invalid_data', fields }.
 */
export function makeCreateProduct({ productRepository, imageStorage }) {
  return async function createProduct(input) {
    const data = {
      name: clean(input.name),
      niche: input.niche,
      category: clean(input.category),
      description: (input.description ?? '').trim(),
      sizes: cleanList(input.sizes),
      colors: cleanList(input.colors),
      fabric: clean(input.fabric),
      price: roundMoney(input.price),
      originalPrice: input.originalPrice == null ? null : roundMoney(input.originalPrice),
      stock: input.stock,
      isFeatured: input.isFeatured ?? false,
      image: input.image ?? null,
    }

    const fields = validateNewProduct(data)
    if (data.image && !imageStorage.isStored(data.image)) fields.image = 'Envie a foto pelo painel.'
    if (Object.keys(fields).length > 0) return { error: 'invalid_data', fields }

    const base = slugify(data.name) || 'produto'
    let id = base
    for (let suffix = 2; await productRepository.findById(id); suffix++) id = `${base}-${suffix}`

    return { product: await productRepository.create({ id, ...data }) }
  }
}
