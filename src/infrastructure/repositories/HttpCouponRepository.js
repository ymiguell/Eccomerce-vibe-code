import { createCoupon } from '../../domain/entities/Coupon.js'

/** Cupons vindos da API (GET /coupons/:code). Mesmos métodos do MockCouponRepository. */
export class HttpCouponRepository {
  #api

  constructor(apiClient) {
    this.#api = apiClient
  }

  async findByCode(code) {
    try {
      return createCoupon(await this.#api.get(`/coupons/${encodeURIComponent(code.trim().toUpperCase())}`))
    } catch (error) {
      if (error.status === 404) return null
      throw error
    }
  }
}
