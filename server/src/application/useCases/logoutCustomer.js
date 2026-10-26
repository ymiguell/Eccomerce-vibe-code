/** Caso de uso: sair da conta. Apaga a sessão no servidor: o token deixa de valer mesmo se alguém o copiou. */
export function makeLogoutCustomer(sessionRepository) {
  return function logoutCustomer(token) {
    return sessionRepository.delete(token)
  }
}
