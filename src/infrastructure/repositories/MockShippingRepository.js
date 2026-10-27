import { calculateSubtotal } from '../../domain/entities/Cart.js'
import { applyFreeShipping, tableShippingOption } from '../../domain/services/shipping.js'

// Usado quando o site roda sem a API: frete pela tabela da loja (taxa fixa e prazo pela região do CEP).
export class MockShippingRepository {
  async quote(cep, items) {
    return { options: applyFreeShipping([tableShippingOption(cep)], calculateSubtotal(items)) }
  }
}
