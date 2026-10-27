import { ORDER_STATUSES } from '../../../domain/entities/Order.js'

export const ORDERS_PAGE_SIZE = 20

/**
 * Caso de uso (painel): uma página de pedidos, mais recentes primeiro, opcionalmente só de uma situação.
 * Vem junto quantos pedidos há em cada situação (os números dos filtros).
 */
export function makeListOrders(orderRepository) {
  return async function listOrders({ status = null, page = 1 } = {}) {
    const [{ orders, total }, counts] = await Promise.all([
      orderRepository.findPage({ status, page, pageSize: ORDERS_PAGE_SIZE }),
      orderRepository.countByStatus(),
    ])

    return {
      orders,
      total,
      page,
      pageSize: ORDERS_PAGE_SIZE,
      counts: Object.fromEntries(ORDER_STATUSES.map((item) => [item, counts[item] ?? 0])),
    }
  }
}
