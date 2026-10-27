import { canChangeOrderStatus } from '../../../domain/entities/Order.js'

/**
 * Caso de uso (painel): mudar a situação do pedido (ex.: pago → enviado).
 * Cancelar devolve os produtos ao estoque.
 * Retorna { order } ou { error: 'order_not_found' | 'invalid_transition' | 'status_changed' }
 * — status_changed: outra pessoa mudou o pedido enquanto a tela estava aberta.
 */
export function makeChangeOrderStatus(orderRepository) {
  return async function changeOrderStatus(orderId, status) {
    const order = await orderRepository.findById(orderId)
    if (!order) return { error: 'order_not_found' }
    if (!canChangeOrderStatus(order.status, status)) return { error: 'invalid_transition' }

    const updated = await orderRepository.changeStatus(orderId, {
      from: order.status,
      to: status,
      restoreStock: status === 'canceled',
    })
    return updated ? { order: updated } : { error: 'status_changed' }
  }
}
