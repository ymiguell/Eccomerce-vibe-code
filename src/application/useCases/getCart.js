import { createCartItem } from '../../domain/entities/Cart.js'
import { isInStock } from '../../domain/entities/Product.js'

/**
 * Caso de uso: montar o carrinho guardado.
 * O repositório do carrinho guarda id, variação (tamanho/cor) e quantidade; os dados do produto vêm do catálogo.
 * Produtos que saíram do catálogo ou esgotaram desde a última visita ficam de fora.
 */
export function makeGetCart({ cartRepository, productRepository }) {
  return async function getCart() {
    const [entries, products] = await Promise.all([cartRepository.getItems(), productRepository.getAll()])

    return entries
      .map(({ productId, quantity, size = null, color = null }) => {
        const product = products.find((item) => item.id === productId)
        if (!product || !isInStock(product)) return null
        return createCartItem({ product, quantity: Number(quantity) || 1, size, color })
      })
      .filter(Boolean)
  }
}
