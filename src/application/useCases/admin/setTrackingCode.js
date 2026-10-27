import { normalizeTrackingCode, validateTrackingCode } from '../../../domain/entities/Order.js'

/**
 * Caso de uso (painel): informar ou corrigir o código de rastreio de um pedido já enviado (vazio apaga).
 * Retorna { order }, { errors } (campo → mensagem) ou { error }.
 */
export function makeSetTrackingCode(adminRepository) {
  return async function setTrackingCode(order, trackingCode) {
    const errors = validateTrackingCode(trackingCode)
    if (Object.keys(errors).length > 0) return { errors }

    const result = await adminRepository.setTrackingCode(order.id, normalizeTrackingCode(trackingCode) || null)
    return result.fields ? { errors: result.fields } : result
  }
}
