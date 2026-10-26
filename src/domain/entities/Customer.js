import { isValidEmail, normalizeEmail } from '../valueObjects/Email.js'
import { isValidPhone, normalizePhone } from '../valueObjects/Phone.js'

/**
 * Quem está comprando (etapa "Identificação" do checkout).
 * Valida os dados digitados. Retorna um objeto { campo: mensagem } — vazio quando está tudo certo.
 */
export function validateCustomer({ name = '', email = '', phone = '' }) {
  const errors = {}

  if (name.trim().split(/\s+/).length < 2) errors.name = 'Informe nome e sobrenome.'
  if (!isValidEmail(email)) errors.email = 'Informe um e-mail válido, ex.: nome@email.com.'
  if (!isValidPhone(phone)) errors.phone = 'Informe o celular com DDD (10 ou 11 números).'

  return errors
}

export function createCustomer(input) {
  const errors = validateCustomer(input)
  if (Object.keys(errors).length > 0) throw new Error(`Cliente inválido: ${Object.values(errors).join(' ')}`)

  return Object.freeze({
    name: input.name.trim().replace(/\s+/g, ' '),
    email: normalizeEmail(input.email),
    phone: normalizePhone(input.phone),
  })
}
