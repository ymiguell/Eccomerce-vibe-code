import { validateAddress } from '../../domain/entities/Address.js'
import { validateCustomer } from '../../domain/entities/Customer.js'
import { calculateOrderTotals, createOrder } from '../../domain/entities/Order.js'
import { isInStock } from '../../domain/entities/Product.js'
import { validatePayment } from '../../domain/services/payment.js'
import { estimateShipping } from '../../domain/services/shipping.js'

// Número do pedido com 6 dígitos, ex.: 482913
const randomOrderNumber = () => String(Math.floor(100000 + Math.random() * 900000))

/**
 * Caso de uso: finalizar a compra.
 * Confere os dados de novo (a tela já valida, mas a regra não pode depender dela), calcula o prazo e salva o pedido.
 * Retorna { order } ou { error: 'empty_cart' | 'out_of_stock' | 'invalid_data' }.
 */
export function makePlaceOrder(orderRepository, { now = () => new Date(), createId = randomOrderNumber } = {}) {
  return async function placeOrder({ items, coupon = null, customer, address, payment }) {
    if (items.length === 0) return { error: 'empty_cart' }
    if (items.some((item) => !isInStock(item.product))) return { error: 'out_of_stock' }

    const { total, subtotal } = calculateOrderTotals(items, coupon, payment)
    const errors = { ...validateCustomer(customer), ...validateAddress(address), ...validatePayment(payment, total) }
    if (Object.keys(errors).length > 0) return { error: 'invalid_data' }

    const order = createOrder({
      id: createId(),
      createdAt: now().toISOString(),
      items,
      coupon,
      customer,
      address,
      payment,
      delivery: estimateShipping(address.cep, subtotal),
    })

    await orderRepository.save(order)
    return { order }
  }
}
