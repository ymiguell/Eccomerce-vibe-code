import { validateProductChanges } from '../../../domain/entities/Product.js'

/**
 * Caso de uso (painel): editar preço, preço original (null = sem promoção), estoque, destaque e, se vier `photo`
 * (imagem já reduzida), trocar a foto. Retorna { product }, { errors } (campo → mensagem) ou { error }.
 */
export function makeUpdateProduct(adminRepository) {
  return async function updateProduct(productId, changes, photo = null) {
    const errors = validateProductChanges(changes)
    if (Object.keys(errors).length > 0) return { errors }

    let image
    if (photo) {
      const upload = await adminRepository.uploadProductImage(photo)
      if (upload.error) return { error: upload.error }
      image = upload.url
    }

    const { product, error, fields } = await adminRepository.updateProduct(productId, { ...changes, ...(image && { image }) })
    if (fields) return { errors: fields }
    if (error) return { error }
    return { product }
  }
}
