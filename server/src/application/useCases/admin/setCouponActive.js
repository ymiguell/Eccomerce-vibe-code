/**
 * Caso de uso (painel): ligar ou desligar um cupom. Desligado, ele para de valer na loja,
 * mas continua nos pedidos antigos. Retorna { coupon } ou { error: 'coupon_not_found' }.
 */
export function makeSetCouponActive(couponRepository) {
  return async function setCouponActive(code, active) {
    const coupon = await couponRepository.setActive(code.trim().toUpperCase(), active)
    return coupon ? { coupon } : { error: 'coupon_not_found' }
  }
}
