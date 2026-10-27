import { ApiError } from '../http/apiClient.js'
import { toOrder } from './HttpOrderRepository.js'
import { toProduct } from './HttpProductRepository.js'

// Erro da API → { error, fields? } para as telas; outros erros (de programação) continuam sendo lançados
function toFailure(error) {
  if (!(error instanceof ApiError)) throw error
  return { error: error.code, ...(error.details.fields && { fields: error.details.fields }) }
}

async function attempt(key, run) {
  try {
    return { [key]: await run() }
  } catch (error) {
    return toFailure(error)
  }
}

/**
 * Painel da loja pela API (/admin). O token de quem está logado vai pelo apiClient; a API confere se é da equipe.
 * Leituras sempre sem cache (a equipe precisa ver o estado atual).
 * Escritas retornam { order | product | coupon | review | removed | url } ou { error, fields? }.
 */
export class HttpAdminRepository {
  #api

  constructor(apiClient) {
    this.#api = apiClient
  }

  async listOrders({ status = null, page = 1 } = {}) {
    const query = new URLSearchParams({ page: String(page), ...(status && { status }) })
    const data = await this.#api.get(`/admin/orders?${query}`, { cache: false })
    return { ...data, orders: data.orders.map(toOrder) }
  }

  /** `trackingCode`: opcional, ao marcar como enviado. */
  changeOrderStatus(orderId, status, { trackingCode = null } = {}) {
    return attempt('order', async () =>
      toOrder(
        await this.#api.patch(`/admin/orders/${encodeURIComponent(orderId)}`, {
          status,
          ...(trackingCode && { trackingCode }),
        }),
      ),
    )
  }

  /** Informa, corrige ou apaga (null) o rastreio de um pedido enviado. */
  setTrackingCode(orderId, trackingCode) {
    return attempt('order', async () =>
      toOrder(await this.#api.patch(`/admin/orders/${encodeURIComponent(orderId)}/tracking`, { trackingCode })),
    )
  }

  /** O estoque vem junto com cada produto no catálogo público. */
  async listProducts() {
    return (await this.#api.get('/products', { cache: false })).map(toProduct)
  }

  updateProduct(productId, changes) {
    return attempt('product', async () =>
      toProduct(await this.#api.patch(`/admin/products/${encodeURIComponent(productId)}`, changes)),
    )
  }

  /** Envia a foto (já reduzida) e devolve { url } — o endereço usado em createProduct/updateProduct. */
  async uploadProductImage(photo) {
    const form = new FormData()
    form.append('image', photo, 'foto')
    try {
      return await this.#api.post('/admin/images', form)
    } catch (error) {
      return toFailure(error)
    }
  }

  createProduct(input) {
    return attempt('product', async () => toProduct(await this.#api.post('/admin/products', input)))
  }

  listCoupons() {
    return this.#api.get('/admin/coupons', { cache: false })
  }

  createCoupon(input) {
    return attempt('coupon', () => this.#api.post('/admin/coupons', input))
  }

  setCouponActive(code, active) {
    return attempt('coupon', () => this.#api.patch(`/admin/coupons/${encodeURIComponent(code)}`, { active }))
  }

  /** `visibility`: 'visible' | 'hidden' | null (todas). */
  async listReviews({ visibility = null, page = 1 } = {}) {
    const query = new URLSearchParams({ page: String(page), ...(visibility && { visibility }) })
    return this.#api.get(`/admin/reviews?${query}`, { cache: false })
  }

  setReviewHidden(reviewId, hidden) {
    return attempt('review', () => this.#api.patch(`/admin/reviews/${encodeURIComponent(reviewId)}`, { hidden }))
  }

  listSubscribers() {
    return this.#api.get('/admin/newsletter', { cache: false })
  }

  async removeSubscriber(email) {
    try {
      await this.#api.delete(`/admin/newsletter/${encodeURIComponent(email)}`)
      return { removed: true }
    } catch (error) {
      return toFailure(error)
    }
  }
}
