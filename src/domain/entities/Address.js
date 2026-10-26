import { isValidCep, normalizeCep } from '../services/shipping.js'

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const REQUIRED_FIELDS = {
  street: 'Informe a rua ou avenida.',
  number: 'Informe o número (ou "S/N").',
  neighborhood: 'Informe o bairro.',
  city: 'Informe a cidade.',
}

/**
 * Endereço de entrega (etapa "Entrega" do checkout). O complemento é opcional.
 * Retorna um objeto { campo: mensagem } — vazio quando está tudo certo.
 */
export function validateAddress(input) {
  const errors = {}

  if (!isValidCep(input.cep ?? '')) errors.cep = 'Informe um CEP válido (8 números).'

  for (const [field, message] of Object.entries(REQUIRED_FIELDS)) {
    if (!(input[field] ?? '').trim()) errors[field] = message
  }

  if (!BRAZILIAN_STATES.includes(input.state)) errors.state = 'Selecione o estado.'

  return errors
}

export function createAddress(input) {
  const errors = validateAddress(input)
  if (Object.keys(errors).length > 0) throw new Error(`Endereço inválido: ${Object.values(errors).join(' ')}`)

  return Object.freeze({
    cep: normalizeCep(input.cep),
    street: input.street.trim(),
    number: input.number.trim(),
    complement: (input.complement ?? '').trim(),
    neighborhood: input.neighborhood.trim(),
    city: input.city.trim(),
    state: input.state,
  })
}
