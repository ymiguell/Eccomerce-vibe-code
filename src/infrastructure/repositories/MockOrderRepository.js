import { calculateOrderTotals, createOrder } from '../../domain/entities/Order.js'
import { estimateShipping } from '../../domain/services/shipping.js'

// Usado quando o site roda sem a API: imita o servidor montando o pedido aqui mesmo, só em memória.
// Nada é salvo no navegador: os dados do cliente somem ao fechar a página.
const NETWORK_DELAY_MS = 900

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export class MockOrderRepository {
  #orders = []

  async submit({ items, coupon, customer, address, payment }) {
    await wait(NETWORK_DELAY_MS)

    const { subtotal } = calculateOrderTotals(items, coupon, payment)
    const order = createOrder({
      id: crypto.randomUUID(),
      number: 1000 + this.#orders.length + 1,
      createdAt: new Date().toISOString(),
      items,
      coupon,
      customer,
      address,
      payment,
      delivery: estimateShipping(address.cep, subtotal),
    })

    this.#orders.push(order)
    return { order }
  }
}
