import { validateLogin } from '../../domain/entities/Account.js'

/**
 * Caso de uso: entrar com e-mail e senha. Dando certo, o token é guardado.
 * Retorna { customer }, { errors } ou { error } (ex.: invalid_credentials, too_many_requests).
 */
export function makeLoginCustomer({ accountRepository, sessionStore }) {
  return async function loginCustomer(input) {
    const errors = validateLogin(input)
    if (Object.keys(errors).length > 0) return { errors }

    const { customer, token, error } = await accountRepository.login(input)
    if (error) return { error }

    sessionStore.save(token)
    return { customer }
  }
}
