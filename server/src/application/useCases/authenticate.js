/** Caso de uso: descobrir de quem é o token de sessão. Retorna a conta ou null (token inválido ou vencido). */
export function makeAuthenticate(sessionRepository) {
  return function authenticate(token) {
    return token ? sessionRepository.findCustomerByToken(token) : null
  }
}
