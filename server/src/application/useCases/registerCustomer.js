import { validateRegistration } from '../../domain/entities/Account.js'
import { normalizeEmail } from '../../domain/valueObjects/Email.js'

/**
 * Caso de uso: criar conta e já deixar o cliente logado.
 * Retorna { customer, token }, { error: 'invalid_data', fields } ou { error: 'email_taken' }.
 */
export function makeRegisterCustomer({ customerRepository, sessionRepository, passwordHasher }) {
  return async function registerCustomer({ name, email, password }) {
    const fields = validateRegistration({ name, email, password })
    if (Object.keys(fields).length > 0) return { error: 'invalid_data', fields }

    const normalizedEmail = normalizeEmail(email)
    if (await customerRepository.emailExists(normalizedEmail)) return { error: 'email_taken' }

    const customer = await customerRepository.create({
      name: name.trim().replace(/\s+/g, ' '),
      email: normalizedEmail,
      passwordHash: await passwordHasher.hash(password),
    })
    return { customer, token: await sessionRepository.create(customer.id) }
  }
}
