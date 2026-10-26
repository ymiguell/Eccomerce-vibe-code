import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { makeListProductReviews } from '../src/application/useCases/listProductReviews.js'
import { makeSubmitReview } from '../src/application/useCases/submitReview.js'
import { makeSubscribeToNewsletter } from '../src/application/useCases/subscribeToNewsletter.js'
import { createProduct } from '../src/domain/entities/Product.js'
import { createReview } from '../src/domain/entities/Review.js'
import { buildApp } from '../src/http/app.js'

// Repositórios em memória (sem PostgreSQL)
let reviews
let subscribers

const productRepository = {
  findById: async (id) =>
    id === 'fritadeira' ? createProduct({ id, name: 'Fritadeira', niche: 'casa', category: 'Cozinha', price: 100 }) : null,
}
const reviewRepository = {
  findByProduct: async (productId) => reviews.filter((review) => review.productId === productId),
  create: async (data) => {
    const review = createReview({ ...data, id: `r${reviews.length + 1}`, date: '2026-10-26' })
    reviews.unshift(review)
    return review
  },
}
const newsletterRepository = {
  add: async (email) => {
    if (subscribers.has(email)) return false
    subscribers.add(email)
    return true
  },
}

const useCases = {
  checkHealth: async () => ({}),
  listProductReviews: makeListProductReviews(reviewRepository),
  submitReview: makeSubmitReview({ productRepository, reviewRepository }),
  subscribeToNewsletter: makeSubscribeToNewsletter(newsletterRepository),
}
const app = await buildApp({ corsOrigins: [], logger: false, rateLimits: false, useCases })

beforeEach(() => {
  reviews = [createReview({ id: 'r0', productId: 'fritadeira', author: 'Carla', rating: 4, comment: 'Funciona muito bem.', date: '2026-09-01' })]
  subscribers = new Set()
})

const request = async (method, url, payload) => {
  const response = await app.inject({ method, url, payload })
  return { status: response.statusCode, body: response.json() }
}

test('GET /products/:id/reviews lista as avaliações do produto', async () => {
  const { status, body } = await request('GET', '/products/fritadeira/reviews')
  assert.equal(status, 200)
  assert.deepEqual(body.map((review) => review.author), ['Carla'])
  assert.equal(body[0].date, '2026-09-01')
})

test('POST /products/:id/reviews publica com data do servidor e texto sem espaços sobrando', async () => {
  const { status, body } = await request('POST', '/products/fritadeira/reviews', {
    author: '  Ana  ',
    rating: 5,
    comment: '  Chegou rápido e é ótima!  ',
  })

  assert.equal(status, 201)
  assert.equal(body.author, 'Ana')
  assert.equal(body.comment, 'Chegou rápido e é ótima!')
  assert.equal(body.date, '2026-10-26')
  assert.equal(body.verifiedPurchase, false)
  assert.equal((await request('GET', '/products/fritadeira/reviews')).body.length, 2)
})

test('POST /products/:id/reviews recusa dados inválidos dizendo os campos', async () => {
  const { status, body } = await request('POST', '/products/fritadeira/reviews', { author: 'A', rating: 3, comment: 'curto' })

  assert.equal(status, 422)
  assert.deepEqual(Object.keys(body.fields).sort(), ['author', 'comment'])
  assert.equal((await request('POST', '/products/fritadeira/reviews', { author: 'Ana', rating: 9, comment: 'x'.repeat(20) })).status, 400)
})

test('POST /products/:id/reviews responde 404 para produto inexistente', async () => {
  const { status } = await request('POST', '/products/nao-existe/reviews', { author: 'Ana', rating: 5, comment: 'Muito bom mesmo.' })
  assert.equal(status, 404)
})

test('POST /newsletter inscreve uma vez, sem diferenciar maiúsculas', async () => {
  assert.equal((await request('POST', '/newsletter', { email: 'Ana@Exemplo.com ' })).status, 201)
  assert.deepEqual([...subscribers], ['ana@exemplo.com'])

  const again = await request('POST', '/newsletter', { email: 'ana@exemplo.com' })
  assert.equal(again.status, 409)
  assert.equal(again.body.error, 'already_subscribed')

  assert.equal((await request('POST', '/newsletter', { email: 'ana@' })).status, 422)
})

test('limite de envios: o 6º envio no mesmo minuto é bloqueado com 429', async () => {
  const limited = await buildApp({ corsOrigins: [], logger: false, useCases })
  const statuses = []
  for (let i = 1; i <= 6; i++) {
    const response = await limited.inject({ method: 'POST', url: '/newsletter', payload: { email: `pessoa${i}@exemplo.com` } })
    statuses.push(response.statusCode)
  }

  assert.deepEqual(statuses, [201, 201, 201, 201, 201, 429])
  const blocked = await limited.inject({ method: 'POST', url: '/newsletter', payload: { email: 'x@exemplo.com' } })
  assert.equal(blocked.json().error, 'too_many_requests')
})
