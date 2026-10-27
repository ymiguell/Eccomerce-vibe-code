import { validateNewProduct } from '../../../domain/entities/Product.js'

/**
 * Caso de uso (painel): cadastrar um produto novo. Confere os dados, envia a foto (já reduzida) e cria o produto.
 * `photo`: a imagem pronta para envio (Blob). Retorna { product }, { errors } (campo → mensagem) ou { error }.
 */
export function makeCreateProduct(adminRepository) {
  return async function createProduct({ photo, ...data }) {
    const errors = validateNewProduct({ ...data, hasPhoto: Boolean(photo) })
    if (Object.keys(errors).length > 0) return { errors }

    const upload = await adminRepository.uploadProductImage(photo)
    if (upload.error) return { error: upload.error }

    const { product, error, fields } = await adminRepository.createProduct({ ...data, image: upload.url })
    if (fields) return { errors: fields }
    if (error) return { error }
    return { product }
  }
}
