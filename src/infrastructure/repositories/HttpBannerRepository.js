import { createBanner } from '../../domain/entities/Banner.js'
import { resolveBannerImage } from '../assets/catalogImages.js'

/** Banners vindos da API (GET /banners). Mesmos métodos do MockBannerRepository. */
export class HttpBannerRepository {
  #api

  constructor(apiClient) {
    this.#api = apiClient
  }

  async getByPlacement(placement) {
    const banners = await this.#api.get(`/banners?placement=${encodeURIComponent(placement)}`)
    return banners.map(({ image, mobileImage, ...data }) =>
      createBanner({ ...data, imageUrl: resolveBannerImage(image), mobileImageUrl: resolveBannerImage(mobileImage) }),
    )
  }
}
