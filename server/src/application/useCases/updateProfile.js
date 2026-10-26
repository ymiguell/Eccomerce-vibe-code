import { validateProfile } from '../../domain/entities/Account.js'
import { normalizePhone } from '../../domain/valueObjects/Phone.js'

/**
 * Caso de uso: atualizar nome e celular da conta (o e-mail é o login e não muda aqui).
 * Retorna { customer } ou { error: 'invalid_data', fields }.
 */
export function makeUpdateProfile(customerRepository) {
  return async function updateProfile(customerId, { name, phone = '' }) {
    const fields = validateProfile({ name, phone })
    if (Object.keys(fields).length > 0) return { error: 'invalid_data', fields }

    const customer = await customerRepository.update(customerId, {
      name: name.trim().replace(/\s+/g, ' '),
      phone: normalizePhone(phone),
    })
    return { customer }
  }
}
