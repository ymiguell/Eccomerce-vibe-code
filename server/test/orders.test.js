import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { makeGetCoupon } from '../src/application/useCases/getCoupon.js'
import { makePlaceOrder } from '../src/application/useCases/placeOrder.js'
import { makeQuoteShipping } from '../src/application/useCases/quoteShipping.js'
import { createCoupon } from '../src/domain/entities/Coupon.js'
import { OutOfStockError } from '../src/domain/entities/Order.js'
import { createProduct } from '../src/domain/entities/Product.js'
import { buildApp } from '../src/http/app.js'
import { TableShippingQuoter } from '../src/infrastructure/shipping/TableShippingQuoter.js'

// Repositórios em memória (sem PostgreSQL). O de pedidos imita a baixa de estoque do banco.
let products
let savedOrders

const productRepository = {
  findByIds: async (ids) => products.filter((product) => ids.includes(product.id)),
}
const coupons = [
  createCoupon({ code: 'BEMVINDO10', type: 'percent', value: 10 }),
  createCoupon({ code: 'VERAO20', type: 'fixed', value: 20, minSubtotal: 150 }),
]
const couponRepository = {
  findActiveByCode: async (code) => coupons.find((coupon) => coupon.code === code.toUpperCase()) ?? null,
}
const orderRepository = {
  create: async (order) => {
    for (const item of order.items) {
      const product = products.find((p) => p.id === item.productId)
      if (product.stock < item.quantity) throw new OutOfStockError(item.productId)
    }
    const saved = { ...order, id: 'uuid-1', number: savedOrders.length + 1, createdAt: '2026-10-26T12:00:00.000Z' }
    savedOrders.push(saved)
    return saved
  },
}

// Frete pela tabela da loja (R$ 19,90, prazo pela região); alguns testes trocam por uma transportadora de mentira
let shippingQuoter
const currentQuoter = { quote: (args) => shippingQuoter.quote(args) }

const app = await buildApp({
  corsOrigins: [],
  logger: false,
  rateLimits: false, // estes testes fazem muitos pedidos seguidos
  useCases: {
    checkHealth: async () => ({}),
    getCoupon: makeGetCoupon(couponRepository),
    quoteShipping: makeQuoteShipping({ productRepository, shippingQuoter: currentQuoter }),
    placeOrder: makePlaceOrder({ productRepository, couponRepository, orderRepository, shippingQuoter: currentQuoter }),
  },
})

beforeEach(() => {
  savedOrders = []
  shippingQuoter = new TableShippingQuoter()
  products = [
    createProduct({ id: 'fritadeira', name: 'Fritadeira', niche: 'casa', category: 'Cozinha', price: 100, colors: ['Preto'], stock: 5, image: 'f.jpg' }),
    createProduct({ id: 'camiseta', name: 'Camiseta', niche: 'moda', category: 'Camisetas', price: 50, sizes: ['P', 'M'], colors: ['Azul', 'Preto'], stock: 3 }),
  ]
})

const validOrder = (overrides = {}) => ({
  items: [{ productId: 'fritadeira', quantity: 2 }],
  couponCode: null,
  customer: { name: 'Ana Teste', email: 'ana@exemplo.com', phone: '(11) 90000-0000' },
  address: { cep: '01310-100', street: 'Av. Paulista', number: '1000', complement: '', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP' },
  payment: { method: 'credit_card', installments: 2 },
  shippingOptionId: 'padrao',
  expectedTotal: 200,
  ...overrides,
})

const post = async (body) => {
  const response = await app.inject({ method: 'POST', url: '/orders', payload: body })
  return { status: response.statusCode, body: response.json() }
}

test('cria o pedido com os valores calculados pelo servidor', async () => {
  const { status, body } = await post(validOrder())

  assert.equal(status, 201)
  assert.equal(body.number, 1)
  // 2 × R$ 100 = R$ 200 → frete grátis (a partir de R$ 199)
  assert.deepEqual(body.totals, { subtotal: 200, discount: 0, pixDiscount: 0, shipping: 0, total: 200 })
  assert.deepEqual(body.payment, { method: 'credit_card', installments: 2, installmentValue: 100 })
  assert.deepEqual(body.delivery, { minDays: 2, maxDays: 7, service: 'Entrega padrão' })
  assert.equal(body.items[0].color, 'Preto', 'cor única é preenchida sozinha')
  assert.equal(body.customer.phone, '11900000000', 'telefone salvo só com os números')
})

test('aplica cupom e desconto do Pix sobre os produtos', async () => {
  // R$ 200 − 10% (BEMVINDO10) = R$ 180 → Pix: −5% = R$ 171
  const { status, body } = await post(
    validOrder({ couponCode: 'bemvindo10', payment: { method: 'pix' }, expectedTotal: 171 }),
  )

  assert.equal(status, 201)
  assert.deepEqual(body.totals, { subtotal: 200, discount: 20, pixDiscount: 9, shipping: 0, total: 171 })
  assert.equal(body.couponCode, 'BEMVINDO10')
})

test('cobra frete abaixo de R$ 199', async () => {
  const { body } = await post(validOrder({ items: [{ productId: 'fritadeira', quantity: 1 }], expectedTotal: 119.9 }))
  assert.equal(body.totals.shipping, 19.9)
  assert.equal(body.totals.total, 119.9)
})

test('recusa quando o total que o cliente viu não bate (preço mudou)', async () => {
  const { status, body } = await post(validOrder({ expectedTotal: 150 }))

  assert.equal(status, 409)
  assert.equal(body.error, 'price_changed')
  assert.equal(body.total, 200)
  assert.equal(savedOrders.length, 0)
})

test('recusa cupom inexistente e cupom abaixo do valor mínimo', async () => {
  assert.equal((await post(validOrder({ couponCode: 'NAOEXISTE' }))).body.error, 'invalid_coupon')

  const belowMinimum = await post(validOrder({ items: [{ productId: 'fritadeira', quantity: 1 }], couponCode: 'VERAO20' }))
  assert.equal(belowMinimum.status, 422)
  assert.equal(belowMinimum.body.error, 'coupon_min_subtotal')
  assert.equal(belowMinimum.body.minSubtotal, 150)
})

test('recusa quantidade acima do estoque, somando as variações do mesmo produto', async () => {
  const { status, body } = await post(
    validOrder({
      items: [
        { productId: 'camiseta', size: 'P', color: 'Azul', quantity: 2 },
        { productId: 'camiseta', size: 'M', color: 'Preto', quantity: 2 },
      ],
    }),
  )

  assert.equal(status, 409)
  assert.deepEqual(body, { error: 'out_of_stock', message: 'Um dos produtos não tem estoque suficiente.', productId: 'camiseta' })
})

test('recusa tamanho ou cor que o produto não tem', async () => {
  const { status, body } = await post(validOrder({ items: [{ productId: 'camiseta', size: 'GG', color: 'Azul', quantity: 1 }] }))

  assert.equal(status, 422)
  assert.equal(body.error, 'invalid_item')
  assert.match(body.message, /Tamanho inválido/)
})

test('recusa produto inexistente', async () => {
  const { body } = await post(validOrder({ items: [{ productId: 'nao-existe', quantity: 1 }] }))
  assert.equal(body.error, 'product_not_found')
  assert.equal(body.productId, 'nao-existe')
})

test('recusa dados de cliente e endereço inválidos, dizendo os campos', async () => {
  const { status, body } = await post(
    validOrder({ customer: { name: 'Ana', email: 'ana@', phone: '123' }, address: { ...validOrder().address, cep: '123' } }),
  )

  assert.equal(status, 422)
  assert.equal(body.error, 'invalid_data')
  assert.deepEqual(Object.keys(body.fields).sort(), ['cep', 'email', 'name', 'phone'])
})

test('recusa parcelas acima do permitido para o valor', async () => {
  // R$ 200 → no máximo 6x (parcela mínima de R$ 30)
  const { body } = await post(validOrder({ payment: { method: 'credit_card', installments: 10 } }))
  assert.equal(body.error, 'invalid_data')
  assert.ok(body.fields.installments)
})

test('recusa corpo malformado antes de chegar ao caso de uso', async () => {
  assert.equal((await post({ ...validOrder(), items: [] })).status, 400)
  assert.equal((await post({ ...validOrder(), payment: { method: 'boleto' } })).status, 400)
  assert.equal((await post({ ...validOrder(), items: [{ productId: 'fritadeira', quantity: 99 }] })).status, 400)
})

test('GET /coupons/:code encontra cupom sem diferenciar maiúsculas', async () => {
  const found = await app.inject({ method: 'GET', url: '/coupons/verao20' })
  assert.equal(found.statusCode, 200)
  assert.deepEqual(found.json(), { code: 'VERAO20', type: 'fixed', value: 20, minSubtotal: 150, description: '' })

  const missing = await app.inject({ method: 'GET', url: '/coupons/XPTO' })
  assert.equal(missing.statusCode, 404)
})

// Transportadora de mentira com duas opções (como o Melhor Envio devolveria)
const carrier = {
  quote: async () => [
    { id: '2', name: 'SEDEX', company: 'Correios', price: 32.5, minDays: 1, maxDays: 4 },
    { id: '1', name: 'PAC', company: 'Correios', price: 21.3, minDays: 3, maxDays: 8 },
  ],
}

const quote = async (body) => {
  const response = await app.inject({ method: 'POST', url: '/shipping/quote', payload: body })
  return { status: response.statusCode, body: response.json() }
}

test('POST /shipping/quote lista as opções da mais barata para a mais cara', async () => {
  shippingQuoter = carrier
  const { status, body } = await quote({ cep: '01310-100', items: [{ productId: 'fritadeira', quantity: 1 }] })

  assert.equal(status, 200)
  assert.deepEqual(
    body.options.map((option) => [option.id, option.price]),
    [
      ['1', 21.3],
      ['2', 32.5],
    ],
  )
})

test('frete grátis a partir de R$ 199 vale só para a opção mais barata', async () => {
  shippingQuoter = carrier
  const { body } = await quote({ cep: '01310-100', items: [{ productId: 'fritadeira', quantity: 2 }] })
  assert.deepEqual(
    body.options.map((option) => [option.name, option.price]),
    [
      ['PAC', 0],
      ['SEDEX', 32.5],
    ],
  )
})

test('o pedido cobra a opção escolhida e guarda o serviço', async () => {
  shippingQuoter = carrier
  const { status, body } = await post(
    validOrder({ items: [{ productId: 'fritadeira', quantity: 1 }], shippingOptionId: '2', expectedTotal: 132.5 }),
  )

  assert.equal(status, 201)
  assert.equal(body.totals.shipping, 32.5)
  assert.deepEqual(body.delivery, { minDays: 1, maxDays: 4, service: 'Correios SEDEX' })
})

test('recusa opção de frete que não existe mais', async () => {
  shippingQuoter = carrier
  const { status, body } = await post(validOrder({ shippingOptionId: 'padrao' }))
  assert.equal(status, 409)
  assert.equal(body.error, 'shipping_option_not_found')
  assert.equal(savedOrders.length, 0)
})

test('transportadora fora do ar: 503 na cotação e no pedido, sem gravar', async (t) => {
  shippingQuoter = {
    quote: async () => {
      throw new Error('timeout')
    },
  }
  t.mock.method(console, 'error', () => {})

  assert.equal((await quote({ cep: '01310-100', items: [{ productId: 'fritadeira', quantity: 1 }] })).status, 503)
  const { status, body } = await post(validOrder())
  assert.equal(status, 503)
  assert.equal(body.error, 'shipping_unavailable')
  assert.equal(savedOrders.length, 0)
})

test('cotação recusa CEP inválido e produto inexistente', async () => {
  const invalidCep = await quote({ cep: '123', items: [{ productId: 'fritadeira', quantity: 1 }] })
  assert.equal(invalidCep.status, 422)
  assert.equal(invalidCep.body.error, 'invalid_cep')

  const missing = await quote({ cep: '01310-100', items: [{ productId: 'nao-existe', quantity: 1 }] })
  assert.equal(missing.body.error, 'product_not_found')
})

test('mostra no máximo 4 opções: a mais barata, a mais rápida e as outras mais baratas', async () => {
  shippingQuoter = {
    quote: async () => [
      { id: 'a', name: 'A', company: '', price: 10, minDays: 5, maxDays: 9 },
      { id: 'b', name: 'B', company: '', price: 12, minDays: 4, maxDays: 8 },
      { id: 'c', name: 'C', company: '', price: 13, minDays: 4, maxDays: 8 },
      { id: 'd', name: 'D', company: '', price: 14, minDays: 3, maxDays: 7 },
      { id: 'e', name: 'E', company: '', price: 15, minDays: 3, maxDays: 7 },
      { id: 'rapida', name: 'Rápida', company: '', price: 40, minDays: 1, maxDays: 2 },
    ],
  }
  const { body } = await quote({ cep: '01310-100', items: [{ productId: 'fritadeira', quantity: 1 }] })
  assert.deepEqual(
    body.options.map((option) => option.id),
    ['a', 'b', 'c', 'rapida'],
  )
})
