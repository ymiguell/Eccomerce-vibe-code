/** Caso de uso (painel): ligar ou desligar um cupom. Retorna { coupon } ou { error }. */
export function makeSetCouponActive(adminRepository) {
  return function setCouponActive(code, active) {
    return adminRepository.setCouponActive(code, active)
  }
}
