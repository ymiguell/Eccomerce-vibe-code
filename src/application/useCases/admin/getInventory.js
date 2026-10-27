/** Caso de uso (painel): todos os produtos, com preço e estoque atuais. */
export function makeGetInventory(adminRepository) {
  return function getInventory() {
    return adminRepository.listProducts()
  }
}
