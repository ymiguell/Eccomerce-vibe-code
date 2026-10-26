/** Caso de uso: pedidos feitos pela conta (logado), dos mais recentes para os mais antigos. */
export function makeListCustomerOrders(orderRepository) {
  return function listCustomerOrders(customerId) {
    return orderRepository.findByCustomer(customerId)
  }
}
