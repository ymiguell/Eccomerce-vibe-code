/** Caso de uso (painel): todos os cupons, ativos ou não, com quantas vezes cada um foi usado. */
export function makeListCoupons(couponRepository) {
  return function listCoupons() {
    return couponRepository.findAll()
  }
}
