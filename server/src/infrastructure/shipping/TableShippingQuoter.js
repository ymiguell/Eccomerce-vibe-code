import { tableShippingOption } from '../../domain/services/shipping.js'

/**
 * Frete pela tabela da própria loja (taxa fixa e prazo por região). Usado enquanto não há conta no Melhor Envio
 * e no ambiente local. Mesmo método do MelhorEnvioShippingQuoter (quote).
 */
export class TableShippingQuoter {
  async quote({ cep }) {
    return [tableShippingOption(cep)]
  }
}
