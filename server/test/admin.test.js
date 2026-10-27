import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { makeChangeOrderStatus } from '../src/application/useCases/admin/changeOrderStatus.js'
import { makeCreateCoupon } from '../src/application/useCases/admin/createCoupon.js'
import { makeListCoupons } from '../src/application/useCases/admin/listCoupons.js'
import { makeListOrders } from '../src/application/useCases/admin/listOrders.js'
import { makeListReviews } from '../src/application/useCases/admin/listReviews.js'
import { makeListSubscribers } from '../src/application/useCases/admin/listSubscribers.js'
import { makeRemoveSubscriber } from '../src/application/useCases/admin/removeSubscriber.js'
import { makeSetCouponActive } from '../src/application/useCases/admin/setCouponActive.js'
import { makeSetReviewHidden } from '../src/application/useCases/admin/setReviewHidden.js'
import { makeSetTrackingCode } from '../src/application/useCases/admin/setTrackingCode.js'
import { makeUpdateProduct } from '../src/application/useCases/admin/updateProduct.js'
import { buildApp } from '../src/http/app.js'

// Repositórios em memória (sem PostgreSQL). Contas: token "equipe" é da loja; "cliente" é uma conta comum.
let orders
let products
let coupons
let reviews
let subscribers

const accountsByToken = {
  equipe: { id: 'a1', name: 'Equipe', email: 'equipe@loja.com', isAdmin: true },
  cliente: { id: 'c1', name: 'Ana Silva', email: 'ana@exemplo.com', isAdmin: false },
}

const orderRepository = {
  findPage: async ({ status, page, pageSize }) => {
    const found = orders.filter((order) => !status || order.status === status).sort((a, b) => b.number - a.number)
    return { orders: found.slice((page - 1) * pageSize, page * pageSize), total: found.length }
  },
  countByStatus: async () => {
    const counts = {}
    for (const order of orders) counts[order.status] = (counts[order.status] ?? 0) + 1
    return counts
  },
  findById: async (id) => orders.find((order) => order.id === id) ?? null,
  changeStatus: async (id, { from, to, restoreStock, trackingCode }) => {
    const order = orders.find((item) => item.id === id && item.status === from)
    if (!order) return null
    order.status = to
    if (trackingCode !== undefined) order.trackingCode = trackingCode
    if (restoreStock) {
      for (const item of order.items) products.find((product) => product.id === item.productId).stock += item.quantity
    }
    return order
  },
  setTrackingCode: async (id, trackingCode) => Object.assign(orders.find((order) => order.id === id), { trackingCode }),
}

const productRepository = {
  findById: async (id) => products.find((product) => product.id === id) ?? null,
  update: async (id, data) => Object.assign(products.find((product) => product.id === id), data),
}

const couponRepository = {
  findAll: async () => coupons,
  exists: async (code) => coupons.some((coupon) => coupon.code === code),
  create: async (data) => {
    const coupon = { ...data, active: true, createdAt: '2026-10-26T12:00:00.000Z', timesUsed: 0 }
    coupons.push(coupon)
    return coupon
  },
  setActive: async (code, active) => {
    const coupon = coupons.find((item) => item.code === code)
    if (!coupon) return null
    coupon.active = active
    return coupon
  },
}

const reviewRepository = {
  findPage: async ({ hidden, page, pageSize }) => {
    const found = reviews.filter((review) => hidden === null || review.hidden === hidden)
    return { reviews: found.slice((page - 1) * pageSize, page * pageSize), total: found.length }
  },
  countByVisibility: async () => ({
    visible: reviews.filter((review) => !review.hidden).length,
    hidden: reviews.filter((review) => review.hidden).length,
  }),
  setHidden: async (id, hidden) => {
    const review = reviews.find((item) => item.id === id)
    return review ? Object.assign(review, { hidden }) : null
  },
}

const newsletterRepository = {
  findAll: async () => subscribers,
  remove: async (email) => {
    const before = subscribers.length
    subscribers = subscribers.filter((item) => item.email !== email)
    return subscribers.length < before
  },
}

const app = await buildApp({
  corsOrigins: [],
  logger: false,
  rateLimits: false,
  useCases: {
    checkHealth: async () => ({}),
    authenticate: async (token) => accountsByToken[token] ?? null,
    admin: {
      listOrders: makeListOrders(orderRepository),
      changeOrderStatus: makeChangeOrderStatus(orderRepository),
      setTrackingCode: makeSetTrackingCode(orderRepository),
      updateProduct: makeUpdateProduct(productRepository),
      listCoupons: makeListCoupons(couponRepository),
      createCoupon: makeCreateCoupon(couponRepository),
      setCouponActive: makeSetCouponActive(couponRepository),
      listReviews: makeListReviews(reviewRepository),
      setReviewHidden: makeSetReviewHidden(reviewRepository),
      listSubscribers: makeListSubscribers(newsletterRepository),
      removeSubscriber: makeRemoveSubscriber(newsletterRepository),
    },
  },
})

beforeEach(() => {
  products = [
    { id: 'camiseta', name: 'Camiseta', price: 59.9, originalPrice: null, stock: 3, isFeatured: false },
    { id: 'vestido', name: 'Vestido', price: 199.9, originalPrice: 249.9, stock: 0, isFeatured: true },
  ]
  orders = [
    { id: 'o1', number: 1, status: 'pending_payment', items: [{ productId: 'camiseta', quantity: 2 }] },
    { id: 'o2', number: 2, status: 'paid', items: [{ productId: 'vestido', quantity: 1 }] },
    { id: 'o3', number: 3, status: 'pending_payment', items: [{ productId: 'vestido', quantity: 1 }] },
  ]
  reviews = [
    { id: 'r1', productId: 'camiseta', productName: 'Camiseta', author: 'Ana', rating: 5, comment: 'Ótima!', hidden: false },
    { id: 'r2', productId: 'vestido', productName: 'Vestido', author: 'Spam', rating: 1, comment: 'Compre em outro site', hidden: false },
  ]
  subscribers = [{ email: 'ana@exemplo.com', createdAt: '2026-10-26T12:00:00.000Z' }]
  coupons = [{ code: 'BEMVINDO10', type: 'percent', value: 10, minSubtotal: 0, description: '', active: true, timesUsed: 4 }]
})

const call = async (method, url, { payload, token = 'equipe' } = {}) => {
  const headers = token ? { authorization: `Bearer ${token}` } : {}
  const response = await app.inject({ method, url, payload, headers })
  return { status: response.statusCode, body: response.body ? response.json() : null }
}

test('o painel exige login (401) e conta da equipe (403), antes até de validar o corpo', async () => {
  assert.equal((await call('GET', '/admin/orders', { token: null })).status, 401)
  assert.equal((await call('GET', '/admin/orders', { token: 'token-inventado' })).status, 401)

  const customer = await call('GET', '/admin/coupons', { token: 'cliente' })
  assert.equal(customer.status, 403)
  assert.equal(customer.body.error, 'forbidden')

  const invalidBody = await call('PATCH', '/admin/orders/o1', { token: 'cliente', payload: { status: 'qualquer' } })
  assert.equal(invalidBody.status, 403)
  assert.equal(orders[0].status, 'pending_payment')
})

test('lista pedidos (mais recentes primeiro), filtra por situação e conta cada situação', async () => {
  const all = await call('GET', '/admin/orders')
  assert.equal(all.status, 200)
  assert.deepEqual(all.body.orders.map((order) => order.number), [3, 2, 1])
  assert.equal(all.body.total, 3)
  assert.deepEqual(all.body.counts, { pending_payment: 2, paid: 1, shipped: 0, delivered: 0, canceled: 0 })

  const pending = await call('GET', '/admin/orders?status=pending_payment')
  assert.deepEqual(pending.body.orders.map((order) => order.number), [3, 1])

  assert.equal((await call('GET', '/admin/orders?status=perdido')).status, 400)
})

test('muda a situação só pelos caminhos permitidos', async () => {
  const paid = await call('PATCH', '/admin/orders/o1', { payload: { status: 'paid' } })
  assert.equal(paid.status, 200)
  assert.equal(paid.body.status, 'paid')

  const skip = await call('PATCH', '/admin/orders/o3', { payload: { status: 'delivered' } })
  assert.equal(skip.status, 422)
  assert.equal(skip.body.error, 'invalid_transition')

  assert.equal((await call('PATCH', '/admin/orders/nao-existe', { payload: { status: 'paid' } })).status, 404)
})

test('cancelar devolve os produtos ao estoque', async () => {
  const canceled = await call('PATCH', '/admin/orders/o1', { payload: { status: 'canceled' } })
  assert.equal(canceled.status, 200)
  assert.equal(products[0].stock, 5)

  // Cancelado é final: não volta nem devolve o estoque de novo
  const again = await call('PATCH', '/admin/orders/o1', { payload: { status: 'canceled' } })
  assert.equal(again.status, 422)
  assert.equal(products[0].stock, 5)
})

test('ao enviar, grava o código de rastreio (normalizado); depois dá para corrigir', async () => {
  const shipped = await call('PATCH', '/admin/orders/o2', { payload: { status: 'shipped', trackingCode: ' aa 123456789 br ' } })
  assert.equal(shipped.status, 200)
  assert.equal(shipped.body.trackingCode, 'AA123456789BR')

  const fixed = await call('PATCH', '/admin/orders/o2/tracking', { payload: { trackingCode: 'AB987654321BR' } })
  assert.equal(fixed.status, 200)
  assert.equal(orders[1].trackingCode, 'AB987654321BR')

  const cleared = await call('PATCH', '/admin/orders/o2/tracking', { payload: { trackingCode: null } })
  assert.equal(cleared.body.trackingCode, null)
})

test('rastreio inválido, ou em pedido que não foi enviado, é recusado', async () => {
  const invalid = await call('PATCH', '/admin/orders/o2', { payload: { status: 'shipped', trackingCode: 'código?' } })
  assert.equal(invalid.status, 422)
  assert.ok(invalid.body.fields.trackingCode)
  assert.equal(orders[1].status, 'paid')

  const notShipping = await call('PATCH', '/admin/orders/o1', { payload: { status: 'paid', trackingCode: 'AA123456789BR' } })
  assert.equal(notShipping.status, 422)

  const notShipped = await call('PATCH', '/admin/orders/o1/tracking', { payload: { trackingCode: 'AA123456789BR' } })
  assert.equal(notShipped.status, 422)
  assert.equal(notShipped.body.error, 'not_shipped')
})

test('se outra pessoa mudou o pedido antes, responde 409', async () => {
  const realChange = orderRepository.changeStatus
  orderRepository.changeStatus = async () => null
  try {
    const result = await call('PATCH', '/admin/orders/o1', { payload: { status: 'paid' } })
    assert.equal(result.status, 409)
    assert.equal(result.body.error, 'status_changed')
  } finally {
    orderRepository.changeStatus = realChange
  }
})

test('edita preço, promoção e estoque; só muda o que foi enviado', async () => {
  const sale = await call('PATCH', '/admin/products/camiseta', { payload: { originalPrice: 79.9, stock: 10 } })
  assert.equal(sale.status, 200)
  assert.deepEqual(
    { price: products[0].price, originalPrice: products[0].originalPrice, stock: products[0].stock },
    { price: 59.9, originalPrice: 79.9, stock: 10 },
  )

  const endSale = await call('PATCH', '/admin/products/vestido', { payload: { originalPrice: null, isFeatured: false } })
  assert.equal(endSale.status, 200)
  assert.equal(products[1].originalPrice, null)
  assert.equal(products[1].isFeatured, false)
})

test('recusa preço original menor que o preço, corpo vazio e produto inexistente', async () => {
  const invalid = await call('PATCH', '/admin/products/camiseta', { payload: { originalPrice: 49.9 } })
  assert.equal(invalid.status, 422)
  assert.ok(invalid.body.fields.originalPrice)
  assert.equal(products[0].originalPrice, null)

  assert.equal((await call('PATCH', '/admin/products/camiseta', { payload: {} })).status, 400)
  assert.equal((await call('PATCH', '/admin/products/camiseta', { payload: { stock: -1 } })).status, 400)
  assert.equal((await call('PATCH', '/admin/products/nao-existe', { payload: { stock: 1 } })).status, 404)
})

test('cria cupom com código em maiúsculas e recusa código repetido ou desconto inválido', async () => {
  const created = await call('POST', '/admin/coupons', {
    payload: { code: ' natal15 ', type: 'percent', value: 15, minSubtotal: 100, description: 'Natal' },
  })
  assert.equal(created.status, 201)
  assert.equal(created.body.code, 'NATAL15')
  assert.equal(created.body.active, true)

  const repeated = await call('POST', '/admin/coupons', { payload: { code: 'natal15', type: 'fixed', value: 10 } })
  assert.equal(repeated.status, 409)

  const invalid = await call('POST', '/admin/coupons', { payload: { code: 'a b', type: 'percent', value: 150 } })
  assert.equal(invalid.status, 422)
  assert.deepEqual(Object.keys(invalid.body.fields).sort(), ['code', 'value'])
})

test('lista cupons e liga/desliga sem apagar', async () => {
  const list = await call('GET', '/admin/coupons')
  assert.equal(list.status, 200)
  assert.equal(list.body[0].timesUsed, 4)

  const off = await call('PATCH', '/admin/coupons/bemvindo10', { payload: { active: false } })
  assert.equal(off.status, 200)
  assert.equal(coupons[0].active, false)

  assert.equal((await call('PATCH', '/admin/coupons/NADA', { payload: { active: true } })).status, 404)
})

test('oculta e mostra avaliações, e filtra por visibilidade', async () => {
  const hidden = await call('PATCH', '/admin/reviews/r2', { payload: { hidden: true } })
  assert.equal(hidden.status, 200)
  assert.equal(hidden.body.hidden, true)

  const onlyHidden = await call('GET', '/admin/reviews?visibility=hidden')
  assert.deepEqual(onlyHidden.body.reviews.map((review) => review.id), ['r2'])
  assert.deepEqual(onlyHidden.body.counts, { visible: 1, hidden: 1 })

  assert.equal((await call('PATCH', '/admin/reviews/r2', { payload: { hidden: false } })).body.hidden, false)
  assert.equal((await call('PATCH', '/admin/reviews/nada', { payload: { hidden: true } })).status, 404)
  assert.equal((await call('GET', '/admin/reviews', { token: 'cliente' })).status, 403)
})

test('lista inscritos da newsletter e tira um e-mail a pedido do cliente', async () => {
  const list = await call('GET', '/admin/newsletter')
  assert.deepEqual(list.body.map((item) => item.email), ['ana@exemplo.com'])

  const removed = await call('DELETE', '/admin/newsletter/ANA@exemplo.com')
  assert.equal(removed.status, 204)
  assert.equal(subscribers.length, 0)

  assert.equal((await call('DELETE', '/admin/newsletter/ana@exemplo.com')).status, 404)
  assert.equal((await call('DELETE', '/admin/newsletter/ana@exemplo.com', { token: 'cliente' })).status, 403)
})
