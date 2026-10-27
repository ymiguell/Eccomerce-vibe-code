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
 * Escritas retornam { order | product | coupon } ou { error, fields? }.
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

  changeOrderStatus(orderId, status) {
    return attempt('order', async () =>
      toOrder(await this.#api.patch(`/admin/orders/${encodeURIComponent(orderId)}`, { status })),
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

  listCoupons() {
    return this.#api.get('/admin/coupons', { cache: false })
  }

  createCoupon(input) {
    return attempt('coupon', () => this.#api.post('/admin/coupons', input))
  }

  setCouponActive(code, active) {
    return attempt('coupon', () => this.#api.patch(`/admin/coupons/${encodeURIComponent(code)}`, { active }))
  }
}
