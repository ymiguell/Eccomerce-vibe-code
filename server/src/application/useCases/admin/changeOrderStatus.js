import { canChangeOrderStatus, isValidTrackingCode, normalizeTrackingCode } from '../../../domain/entities/Order.js'

/**
 * Caso de uso (painel): mudar a situação do pedido (ex.: pago → enviado).
 * Cancelar devolve os produtos ao estoque. Ao marcar como enviado, dá para informar o código de rastreio (opcional).
 * Retorna { order } ou { error: 'order_not_found' | 'invalid_transition' | 'status_changed' | 'invalid_data', fields? }
 * — status_changed: outra pessoa mudou o pedido enquanto a tela estava aberta.
 */
export function makeChangeOrderStatus(orderRepository) {
  return async function changeOrderStatus(orderId, status, { trackingCode = null } = {}) {
    const code = trackingCode ? normalizeTrackingCode(trackingCode) : null
    if (code && (status !== 'shipped' || !isValidTrackingCode(code))) {
      return { error: 'invalid_data', fields: { trackingCode: 'Use de 4 a 40 letras, números ou hífen.' } }
    }

    const order = await orderRepository.findById(orderId)
    if (!order) return { error: 'order_not_found' }
    if (!canChangeOrderStatus(order.status, status)) return { error: 'invalid_transition' }

    const updated = await orderRepository.changeStatus(orderId, {
      from: order.status,
      to: status,
      restoreStock: status === 'canceled',
      ...(code && { trackingCode: code }),
    })
    return updated ? { order: updated } : { error: 'status_changed' }
  }
}
