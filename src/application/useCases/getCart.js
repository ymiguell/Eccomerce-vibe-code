import { createCartItem } from '../../domain/entities/Cart.js'

/**
 * Caso de uso: montar o carrinho atual.
 * O repositório do carrinho guarda id, variação (tamanho/cor) e quantidade; os dados do produto vêm do catálogo.
 */
export function makeGetCart({ cartRepository, productRepository }) {
  return async function getCart() {
    const [entries, products] = await Promise.all([cartRepository.getItems(), productRepository.getAll()])

    return entries
      .map(({ productId, quantity, size = null, color = null }) => {
        const product = products.find((item) => item.id === productId)
        return product ? createCartItem({ product, quantity, size, color }) : null
      })
      .filter(Boolean)
  }
}
