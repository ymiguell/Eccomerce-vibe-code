import { validateProductChanges } from '../../../domain/entities/Product.js'

/**
 * Caso de uso (painel): editar preço, preço original (null = sem promoção), estoque e destaque.
 * Retorna { product }, { errors } (campo → mensagem) ou { error }.
 */
export function makeUpdateProduct(adminRepository) {
  return async function updateProduct(productId, changes) {
    const errors = validateProductChanges(changes)
    if (Object.keys(errors).length > 0) return { errors }

    const { product, error, fields } = await adminRepository.updateProduct(productId, changes)
    if (fields) return { errors: fields }
    if (error) return { error }
    return { product }
  }
}
