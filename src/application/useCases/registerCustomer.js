import { validateRegistration } from '../../domain/entities/Account.js'

/**
 * Caso de uso: criar conta. Dando certo, o cliente já fica logado (o token é guardado).
 * Retorna { customer }, { errors: { campo: mensagem } } ou { error } (ex.: email_taken, network_error).
 */
export function makeRegisterCustomer({ accountRepository, sessionStore }) {
  return async function registerCustomer(input) {
    const errors = validateRegistration(input)
    if (Object.keys(errors).length > 0) return { errors }

    const { customer, token, error, fields } = await accountRepository.register(input)
    if (fields) return { errors: fields }
    if (error) return { error }

    sessionStore.save(token)
    return { customer }
  }
}
