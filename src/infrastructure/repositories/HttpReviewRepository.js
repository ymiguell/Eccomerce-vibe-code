import { createReview } from '../../domain/entities/Review.js'
import { ApiError } from '../http/apiClient.js'

/** Avaliações vindas da API (GET/POST /products/:id/reviews). Mesmos métodos do MockReviewRepository. */
export class HttpReviewRepository {
  #api

  constructor(apiClient) {
    this.#api = apiClient
  }

  async getByProduct(productId) {
    // Sem cache: uma avaliação recém-publicada tem que aparecer ao voltar para o produto
    const reviews = await this.#api.get(`/products/${encodeURIComponent(productId)}/reviews`, { cache: false })
    return reviews.map(createReview)
  }

  /** Retorna { review }, { errors } (campos inválidos) ou { error } (ex.: sem conexão, muitas tentativas). */
  async create(productId, input) {
    try {
      const review = await this.#api.post(`/products/${encodeURIComponent(productId)}/reviews`, input)
      return { review: createReview(review) }
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
      if (error.status === 422 && error.details.fields) return { errors: error.details.fields }
      return { error: error.code } // ex.: network_error, too_many_requests, product_not_found
    }
  }
}
