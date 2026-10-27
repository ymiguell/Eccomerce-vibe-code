import { canChangeOrderStatus, normalizeTrackingCode, validateTrackingCode } from '../../../domain/entities/Order.js'

/**
 * Caso de uso (painel): mudar a situação do pedido (ex.: pago → enviado). Cancelar devolve o estoque (no servidor).
 * Ao marcar como enviado dá para informar o código de rastreio (opcional).
 * Retorna { order }, { errors } (campo → mensagem) ou { error }.
 */
export function makeChangeOrderStatus(adminRepository) {
  return async function changeOrderStatus(order, status, { trackingCode = '' } = {}) {
    if (!canChangeOrderStatus(order.status, status)) return { error: 'invalid_transition' }

    const errors = validateTrackingCode(trackingCode)
    if (Object.keys(errors).length > 0) return { errors }

    const code = normalizeTrackingCode(trackingCode)
    const result = await adminRepository.changeOrderStatus(order.id, status, {
      trackingCode: status === 'shipped' && code ? code : null,
    })
    return result.fields ? { errors: result.fields } : result
  }
}
