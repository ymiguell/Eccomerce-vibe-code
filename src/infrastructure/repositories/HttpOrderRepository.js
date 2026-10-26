import { toCartEntry } from '../../domain/entities/Cart.js'
import { resolveProductImage } from '../assets/catalogImages.js'
import { ApiError } from '../http/apiClient.js'

// Pedido da API → formato usado pelas telas (o mesmo do MockOrderRepository)
function toOrder(data) {
  return {
    ...data,
    coupon: data.couponCode ? { code: data.couponCode } : null,
    items: data.items.map((item) => ({
      product: {
        id: item.productId,
        name: item.productName,
        imageUrl: resolveProductImage(item.productImage),
        price: item.unitPrice,
      },
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    })),
  }
}

/**
 * Envia o pedido para a API (POST /orders). Vão só as escolhas do cliente e o total que ele viu;
 * preços, descontos e frete são recalculados no servidor.
 * Retorna { order } ou { error, ...detalhes } com o código de erro da API.
 */
export class HttpOrderRepository {
  #api

  constructor(apiClient) {
    this.#api = apiClient
  }

  async submit({ items, coupon, customer, address, payment, expectedTotal }) {
    try {
      const data = await this.#api.post('/orders', {
        // Mesmo formato que a sacola guarda no navegador: { productId, size, color, quantity }
        items: items.map(toCartEntry),
        couponCode: coupon?.code ?? null,
        customer,
        address,
        payment,
        expectedTotal,
      })
      return { order: toOrder(data) }
    } catch (error) {
      // A API explicou o motivo (estoque, cupom, preço mudou, muitas tentativas...) ou não respondeu (network_error)
      if (!(error instanceof ApiError)) throw error
      return { error: error.code, ...error.details }
    }
  }
}
