/** Caso de uso (painel): todos os cupons, ativos ou não, com quantas vezes cada um foi usado. */
export function makeGetCoupons(adminRepository) {
  return function getCoupons() {
    return adminRepository.listCoupons()
  }
}
