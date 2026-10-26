import { isValidCep, normalizeCep } from '../../domain/services/shipping.js'

/**
 * Caso de uso: preencher o endereço a partir do CEP.
 * Retorna { address: { street, neighborhood, city, state } } ou
 * { error: 'invalid_cep' | 'not_found' | 'unavailable' } — nos erros, o cliente preenche à mão.
 */
export function makeFindAddressByCep(addressLookup) {
  return async function findAddressByCep(cep) {
    if (!isValidCep(cep)) return { error: 'invalid_cep' }

    try {
      const address = await addressLookup.findByCep(normalizeCep(cep))
      return address ? { address } : { error: 'not_found' }
    } catch {
      return { error: 'unavailable' }
    }
  }
}
