import { validateProfile } from '../../domain/entities/Account.js'

/**
 * Caso de uso: atualizar nome e celular da conta.
 * Retorna { customer }, { errors } ou { error }.
 */
export function makeUpdateProfile(accountRepository) {
  return async function updateProfile(input) {
    const errors = validateProfile(input)
    if (Object.keys(errors).length > 0) return { errors }

    const { customer, error, fields } = await accountRepository.updateMe(input)
    if (fields) return { errors: fields }
    if (error) return { error }
    return { customer }
  }
}
