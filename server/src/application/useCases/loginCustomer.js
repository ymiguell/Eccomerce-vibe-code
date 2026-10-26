import { normalizeEmail } from '../../domain/valueObjects/Email.js'

/**
 * Caso de uso: entrar com e-mail e senha.
 * Retorna { customer, token } ou { error: 'invalid_credentials' } — a mesma resposta para e-mail inexistente
 * e senha errada, para não revelar quais e-mails têm conta.
 */
export function makeLoginCustomer({ customerRepository, sessionRepository, passwordHasher }) {
  // Hash de uma senha qualquer: com e-mail inexistente ainda fazemos a verificação, então a resposta
  // demora o mesmo tempo e o tempo de resposta também não revela se a conta existe
  const decoyHash = passwordHasher.hash('senha-que-nao-existe-1')

  return async function loginCustomer({ email, password }) {
    const credentials = await customerRepository.findCredentialsByEmail(normalizeEmail(email))
    const matches = await passwordHasher.verify(password, credentials?.passwordHash ?? (await decoyHash))
    if (!credentials || !matches) return { error: 'invalid_credentials' }

    return { customer: credentials.customer, token: await sessionRepository.create(credentials.customer.id) }
  }
}
