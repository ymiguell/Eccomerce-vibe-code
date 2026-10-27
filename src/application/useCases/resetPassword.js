import { validateNewPassword } from '../../domain/entities/Account.js'

/**
 * Caso de uso: criar a senha nova com o token do link do e-mail. Dando certo, o cliente já entra (o token de
 * sessão é guardado) e as sessões dos outros aparelhos deixam de valer.
 * Retorna { customer }, { errors } ou { error } (ex.: invalid_token quando o link venceu ou já foi usado).
 */
export function makeResetPassword({ accountRepository, sessionStore }) {
  return async function resetPassword({ token, password }) {
    const errors = validateNewPassword({ password })
    if (Object.keys(errors).length > 0) return { errors }

    const { customer, token: sessionToken, error, fields } = await accountRepository.resetPassword({ token, password })
    if (fields) return { errors: fields }
    if (error) return { error }

    sessionStore.save(sessionToken)
    return { customer }
  }
}
