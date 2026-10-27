import { canChangeOrderStatus } from '../../../domain/entities/Order.js'

/**
 * Caso de uso (painel): mudar a situação do pedido (ex.: pago → enviado). Cancelar devolve o estoque (no servidor).
 * Retorna { order } ou { error }.
 */
export function makeChangeOrderStatus(adminRepository) {
  return async function changeOrderStatus(order, status) {
    if (!canChangeOrderStatus(order.status, status)) return { error: 'invalid_transition' }
    return adminRepository.changeOrderStatus(order.id, status)
  }
}
