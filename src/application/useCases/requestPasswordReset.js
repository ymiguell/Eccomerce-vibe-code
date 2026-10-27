import { validateForgotPassword } from '../../domain/entities/Account.js'

/**
 * Caso de uso: "esqueci minha senha". Pede à loja o e-mail com o link para criar uma senha nova.
 * Retorna { sent: true } (com ou sem conta: a resposta não revela quem é cliente), { errors } ou { error }.
 */
export function makeRequestPasswordReset(accountRepository) {
  return async function requestPasswordReset(input) {
    const errors = validateForgotPassword(input)
    if (Object.keys(errors).length > 0) return { errors }

    const { sent, error, fields } = await accountRepository.requestPasswordReset(input)
    if (fields) return { errors: fields }
    if (error) return { error }
    return { sent }
  }
}
