/**
 * Caso de uso (painel): uma página de pedidos, opcionalmente só de uma situação.
 * Retorna { orders, total, page, pageSize, counts } — counts: quantos pedidos há em cada situação.
 */
export function makeGetAdminOrders(adminRepository) {
  return function getAdminOrders({ status = null, page = 1 } = {}) {
    return adminRepository.listOrders({ status, page })
  }
}
