/** Caso de uso: pedidos feitos com a conta logada, dos mais recentes para os mais antigos. */
export function makeGetMyOrders(accountRepository) {
  return function getMyOrders() {
    return accountRepository.listOrders()
  }
}
