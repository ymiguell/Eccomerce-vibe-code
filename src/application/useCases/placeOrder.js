import { validateAddress } from '../../domain/entities/Address.js'
import { validateCustomer } from '../../domain/entities/Customer.js'
import { calculateOrderTotals } from '../../domain/entities/Order.js'
import { isInStock } from '../../domain/entities/Product.js'
import { validatePayment } from '../../domain/services/payment.js'

/**
 * Caso de uso: finalizar a compra.
 * Confere os dados antes de enviar (resposta rápida para o cliente) e manda junto o total que ele viu na tela.
 * `shipping` é a opção de frete escolhida na etapa de entrega (ver quoteShipping).
 * Quem grava e decide os valores finais é o repositório: a API recalcula tudo e recusa se o total não bater.
 * Retorna { order } ou { error, ...detalhes } — ver os códigos em CheckoutPage.
 */
export function makePlaceOrder(orderRepository) {
  return async function placeOrder({ items, coupon = null, customer, address, shipping, payment }) {
    if (items.length === 0) return { error: 'empty_cart' }
    if (items.some((item) => !isInStock(item.product))) return { error: 'out_of_stock' }
    if (!shipping) return { error: 'invalid_data' }

    const { total } = calculateOrderTotals(items, coupon, payment, shipping.price)
    const errors = { ...validateCustomer(customer), ...validateAddress(address), ...validatePayment(payment, total) }
    if (Object.keys(errors).length > 0) return { error: 'invalid_data' }

    return orderRepository.submit({ items, coupon, customer, address, shipping, payment, expectedTotal: total })
  }
}
