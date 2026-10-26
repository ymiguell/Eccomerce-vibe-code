/**
 * Caso de uso: buscar um cupom ativo pelo código (sem diferenciar maiúsculas).
 * Retorna null quando não existe ou foi desativado. Se o mínimo da compra foi atingido, quem decide é o pedido.
 */
export function makeGetCoupon(couponRepository) {
  return function getCoupon(code) {
    return couponRepository.findActiveByCode(code)
  }
}
