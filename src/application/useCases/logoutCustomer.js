/**
 * Caso de uso: sair da conta. Apaga o token do navegador mesmo se o servidor não responder:
 * o cliente nunca fica "preso" logado.
 */
export function makeLogoutCustomer({ accountRepository, sessionStore }) {
  return async function logoutCustomer() {
    try {
      await accountRepository.logout()
    } finally {
      sessionStore.clear()
    }
  }
}
