import { estimateShipping as calculate, isValidCep } from '../../domain/services/shipping.js'

/**
 * Caso de uso: calcular prazo e valor do frete para um CEP.
 * Hoje usa a tabela de prazos do domínio; depois pode consultar a transportadora sem mudar a tela.
 * Retorna { estimate } ou { error: 'invalid_cep' }.
 */
export function makeEstimateShipping() {
  return async function estimateShipping(cep, subtotal) {
    if (!isValidCep(cep)) return { error: 'invalid_cep' }
    return { estimate: calculate(cep, subtotal) }
  }
}
