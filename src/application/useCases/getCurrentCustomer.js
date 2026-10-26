/**
 * Caso de uso: quem está logado. Sem token guardado não chama a API.
 * Se a sessão venceu ou foi encerrada em outro lugar, apaga o token e retorna null.
 */
export function makeGetCurrentCustomer({ accountRepository, sessionStore }) {
  return async function getCurrentCustomer() {
    if (!sessionStore.get()) return null

    const customer = await accountRepository.getMe()
    if (!customer) sessionStore.clear()
    return customer
  }
}
