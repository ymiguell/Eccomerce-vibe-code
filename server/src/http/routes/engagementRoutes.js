import { listReviewsSchema, submitReviewSchema, subscribeSchema } from '../schemas/engagementSchemas.js'

// Quantos envios cada visitante (endereço IP) pode fazer por minuto: barra spam e robôs
const perMinute = (max) => ({ rateLimit: { max, timeWindow: '1 minute' } })

/**
 * Rotas de interação do cliente:
 * - GET  /products/:id/reviews → avaliações, das mais recentes para as mais antigas
 * - POST /products/:id/reviews → publica uma avaliação (201)
 * - POST /newsletter           → inscreve um e-mail (201; 409 se já inscrito)
 */
export async function engagementRoutes(app, { listProductReviews, submitReview, subscribeToNewsletter }) {
  app.get('/products/:id/reviews', { schema: listReviewsSchema }, async (request) =>
    listProductReviews(request.params.id),
  )

  app.post('/products/:id/reviews', { schema: submitReviewSchema, config: perMinute(5) }, async (request, reply) => {
    const { review, errors, error } = await submitReview(request.params.id, request.body)
    if (review) return reply.code(201).send(review)
    if (error === 'product_not_found') {
      return reply.code(404).send({ error, message: 'Produto não encontrado.' })
    }
    return reply.code(422).send({ error: 'invalid_data', message: 'Confira os dados da avaliação.', fields: errors })
  })

  app.post('/newsletter', { schema: subscribeSchema, config: perMinute(5) }, async (request, reply) => {
    const result = await subscribeToNewsletter(request.body.email)
    if (result.ok) return reply.code(201).send({ ok: true })
    if (result.error === 'already_subscribed') {
      return reply.code(409).send({ error: result.error, message: 'Este e-mail já está inscrito.' })
    }
    return reply.code(422).send({ error: result.error, message: 'Digite um e-mail válido.' })
  })
}
