import { roundMoney } from '../../../domain/entities/Coupon.js'
import { validateProductChanges } from '../../../domain/entities/Product.js'

/**
 * Caso de uso (painel): editar preço, preço original (promoção), estoque, destaque e foto de um produto.
 * Só os campos enviados mudam; `originalPrice: null` tira a promoção. A foto nova precisa ter sido enviada
 * pelo painel (uploadProductImage).
 * Retorna { product } ou { error: 'product_not_found' | 'invalid_data', fields? }.
 */
export function makeUpdateProduct(productRepository, imageStorage) {
  return async function updateProduct(productId, changes) {
    const product = await productRepository.findById(productId)
    if (!product) return { error: 'product_not_found' }

    const originalPrice = changes.originalPrice !== undefined ? changes.originalPrice : product.originalPrice
    const next = {
      price: roundMoney(changes.price ?? product.price),
      originalPrice: originalPrice === null ? null : roundMoney(originalPrice),
      stock: changes.stock ?? product.stock,
      isFeatured: changes.isFeatured ?? product.isFeatured,
      image: changes.image ?? product.image,
    }

    const fields = validateProductChanges(next)
    if (changes.image !== undefined && !imageStorage?.isStored(changes.image)) fields.image = 'Envie a foto pelo painel.'
    if (Object.keys(fields).length > 0) return { error: 'invalid_data', fields }

    return { product: await productRepository.update(productId, next) }
  }
}
