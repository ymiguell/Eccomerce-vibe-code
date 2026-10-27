import { MAX_QUANTITY, calculateSubtotal } from '../../domain/entities/Cart.js'
import { applyFreeShipping, isValidCep, normalizeCep } from '../../domain/services/shipping.js'

/**
 * Opções de frete para um CEP e uma lista de { product, quantity } já carregados do banco.
 * Usado pela cotação (página do produto e checkout) e de novo ao gravar o pedido, para o preço valer o de agora.
 * Retorna { options } ou { error: 'shipping_unavailable' } (transportadora fora do ar ou nenhuma atende o CEP).
 */
export async function quoteOptions(shippingQuoter, cep, items) {
  let options
  try {
    options = await shippingQuoter.quote({ cep: normalizeCep(cep), items })
  } catch (error) {
    console.error('Falha ao cotar o frete:', error)
    return { error: 'shipping_unavailable' }
  }
  if (options.length === 0) return { error: 'shipping_unavailable' }
  return { options: applyFreeShipping(options, calculateSubtotal(items)) }
}

/**
 * Caso de uso: cotar o frete de uma sacola (ou de um produto, na página dele).
 * `items`: [{ productId, quantity }] — tamanho e cor não mudam o frete.
 * Retorna { options } ou { error }: invalid_cep · product_not_found { productId } · invalid_data · shipping_unavailable
 */
export function makeQuoteShipping({ productRepository, shippingQuoter }) {
  return async function quoteShipping({ cep, items: lines }) {
    if (!isValidCep(cep)) return { error: 'invalid_cep' }
    if (lines.length === 0 || lines.some((line) => !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QUANTITY)) {
      return { error: 'invalid_data' }
    }

    const products = await productRepository.findByIds([...new Set(lines.map((line) => line.productId))])
    const productById = new Map(products.map((product) => [product.id, product]))
    const missing = lines.find((line) => !productById.has(line.productId))
    if (missing) return { error: 'product_not_found', productId: missing.productId }

    return quoteOptions(
      shippingQuoter,
      cep,
      lines.map((line) => ({ product: productById.get(line.productId), quantity: line.quantity })),
    )
  }
}
