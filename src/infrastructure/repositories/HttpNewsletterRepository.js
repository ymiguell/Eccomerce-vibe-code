import { ApiError } from '../http/apiClient.js'

/** Inscrição na newsletter pela API (POST /newsletter). Mesmos métodos do MockNewsletterRepository. */
export class HttpNewsletterRepository {
  #api

  constructor(apiClient) {
    this.#api = apiClient
  }

  /** Retorna { ok: true } ou { error } (already_subscribed, invalid_email, network_error, too_many_requests...). */
  async subscribe(email) {
    try {
      await this.#api.post('/newsletter', { email })
      return { ok: true }
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
      return { error: error.code }
    }
  }
}
