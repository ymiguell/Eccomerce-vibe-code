/** Caso de uso (painel): tirar um e-mail da newsletter, a pedido do cliente. Retorna { removed } ou { error }. */
export function makeRemoveSubscriber(adminRepository) {
  return function removeSubscriber(email) {
    return adminRepository.removeSubscriber(email)
  }
}
