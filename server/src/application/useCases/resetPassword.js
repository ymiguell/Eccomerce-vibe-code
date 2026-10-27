import { validatePassword } from '../../domain/entities/Account.js'

/**
 * Caso de uso: criar a senha nova pelo link do e-mail. Sai de todos os aparelhos (quem tinha a senha antiga
 * perde o acesso) e já deixa o cliente logado neste.
 * Retorna { customer, token }, { error: 'invalid_data', fields } ou { error: 'invalid_token' } (link vencido ou usado).
 */
export function makeResetPassword({ customerRepository, sessionRepository, passwordResetRepository, passwordHasher }) {
  return async function resetPassword({ token, password }) {
    // Confere a senha antes de usar o link: senha fraca não gasta o link
    const passwordError = validatePassword(password)
    if (passwordError) return { error: 'invalid_data', fields: { password: passwordError } }

    const customerId = await passwordResetRepository.consume(token)
    if (!customerId) return { error: 'invalid_token' }

    const customer = await customerRepository.updatePassword(customerId, await passwordHasher.hash(password))
    await sessionRepository.deleteAllForCustomer(customerId)
    return { customer, token: await sessionRepository.create(customerId) }
  }
}
