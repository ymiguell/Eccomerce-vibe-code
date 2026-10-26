import { createProduct } from '../../domain/entities/Product.js'
import { resolveProductImage } from '../assets/catalogImages.js'

// Produto da API → entidade do domínio (a foto vem pelo nome do arquivo)
const toProduct = ({ image, ...data }) => createProduct({ ...data, imageUrl: resolveProductImage(image) })

/** Catálogo vindo da API (GET /products). Mesmos métodos do MockProductRepository. */
export class HttpProductRepository {
  #api

  constructor(apiClient) {
    this.#api = apiClient
  }

  async getAll() {
    return (await this.#api.get('/products')).map(toProduct)
  }

  async getFeatured() {
    return (await this.#api.get('/products?featured=true')).map(toProduct)
  }

  async getById(id) {
    try {
      return toProduct(await this.#api.get(`/products/${encodeURIComponent(id)}`))
    } catch (error) {
      if (error.status === 404) return null
      throw error
    }
  }

  async getByNiche(niche) {
    return (await this.#api.get(`/products?niche=${encodeURIComponent(niche)}`)).map(toProduct)
  }
}
