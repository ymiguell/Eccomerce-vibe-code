import { ApiError } from '../http/apiClient.js'

/**
 * Cota o frete na API (POST /shipping/quote), que consulta a transportadora.
 * Retorna { options } ou { error, ...detalhes } com o código de erro da API.
 */
export class HttpShippingRepository {
  #api

  constructor(apiClient) {
    this.#api = apiClient
  }

  async quote(cep, items) {
    try {
      const { options } = await this.#api.post('/shipping/quote', {
        cep,
        items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      })
      return { options }
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
      return { error: error.code, ...error.details }
    }
  }
}
