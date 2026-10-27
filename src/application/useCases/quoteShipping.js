import { isValidCep, normalizeCep } from '../../domain/services/shipping.js'

/**
 * Caso de uso: opções de frete para um CEP e uma lista de { product, quantity } (a sacola, ou um produto na página dele).
 * Com a API, quem cota é a transportadora; sem ela, a tabela da loja.
 * Retorna { options } (da mais barata para a mais cara) ou { error }: invalid_cep · shipping_unavailable · network_error...
 */
export function makeQuoteShipping(shippingRepository) {
  return async function quoteShipping(cep, items) {
    if (!isValidCep(cep)) return { error: 'invalid_cep' }
    return shippingRepository.quote(normalizeCep(cep), items)
  }
}
