import { SHIPPED_STATUSES, isValidTrackingCode, normalizeTrackingCode } from '../../../domain/entities/Order.js'

/**
 * Caso de uso (painel): informar ou corrigir o código de rastreio de um pedido já enviado.
 * Vazio/null apaga o código. Retorna { order } ou { error: 'order_not_found' | 'not_shipped' | 'invalid_data', fields? }.
 */
export function makeSetTrackingCode(orderRepository) {
  return async function setTrackingCode(orderId, trackingCode) {
    const code = trackingCode ? normalizeTrackingCode(trackingCode) : null
    if (code && !isValidTrackingCode(code)) {
      return { error: 'invalid_data', fields: { trackingCode: 'Use de 4 a 40 letras, números ou hífen.' } }
    }

    const order = await orderRepository.findById(orderId)
    if (!order) return { error: 'order_not_found' }
    if (!SHIPPED_STATUSES.includes(order.status)) return { error: 'not_shipped' }

    return { order: await orderRepository.setTrackingCode(orderId, code) }
  }
}
