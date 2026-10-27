import { MAX_IMAGE_BYTES, detectImageType } from '../../../domain/entities/Product.js'

/**
 * Caso de uso (painel): guardar a foto de um produto. Confere pelo conteúdo do arquivo que é JPG, PNG ou WebP.
 * Retorna { url } ou { error: 'invalid_image' | 'image_too_large' }.
 */
export function makeUploadProductImage(imageStorage) {
  return async function uploadProductImage(bytes) {
    if (bytes.length > MAX_IMAGE_BYTES) return { error: 'image_too_large' }
    const type = detectImageType(bytes)
    if (!type) return { error: 'invalid_image' }
    return { url: await imageStorage.save(bytes, type) }
  }
}
