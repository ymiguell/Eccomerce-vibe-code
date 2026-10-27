import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import fastifyStatic from '@fastify/static'
import Fastify from 'fastify'
import { addAuthentication } from './authentication.js'
import { accountRoutes } from './routes/accountRoutes.js'
import { adminRoutes } from './routes/adminRoutes.js'
import { catalogRoutes } from './routes/catalogRoutes.js'
import { engagementRoutes } from './routes/engagementRoutes.js'
import { healthRoutes } from './routes/healthRoutes.js'
import { orderRoutes } from './routes/orderRoutes.js'

/**
 * Monta a API: CORS, limite de envios, respostas de erro padronizadas e rotas.
 * Recebe os casos de uso prontos (ver server.js), então os testes podem passar versões falsas.
 * - `trustProxy`: true na hospedagem (atrás de proxy), para o limite por visitante usar o IP real.
 * - `rateLimits`: false nos testes que fazem muitas requisições seguidas.
 * - `uploadsDir`: pasta das fotos enviadas pelo painel, servida em /uploads/ (só no ambiente local).
 */
export async function buildApp({ corsOrigins, useCases, logger = true, trustProxy = false, rateLimits = true, uploadsDir = null }) {
  const app = Fastify({ logger, trustProxy })

  // Erros sempre no mesmo formato: { error: código, message: texto para o usuário }.
  // Definido antes das rotas para valer em todas elas.
  app.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      return reply.code(400).send({ error: 'invalid_request', message: error.message })
    }
    if (error.statusCode && error.statusCode < 500) {
      return reply.code(error.statusCode).send({ error: error.code ?? 'bad_request', message: error.message })
    }

    // Erro inesperado: os detalhes vão para o log, nunca para a resposta
    request.log.error(error)
    return reply.code(500).send({ error: 'internal_error', message: 'Erro inesperado. Tente novamente.' })
  })

  app.setNotFoundHandler((request, reply) =>
    reply.code(404).send({ error: 'not_found', message: 'Rota não encontrada.' }),
  )

  // Só o site da loja (e o ambiente local) pode chamar a API pelo navegador
  await app.register(cors, { origin: corsOrigins, methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE'] })

  // Quem está logado (request.customer), a partir do token de sessão
  if (useCases.authenticate) addAuthentication(app, useCases.authenticate)

  // Limite de envios por visitante: só nas rotas que pedem (config.rateLimit), as que gravam dados
  if (rateLimits) {
    await app.register(rateLimit, {
      global: false,
      errorResponseBuilder: () => ({
        statusCode: 429,
        code: 'too_many_requests',
        message: 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.',
      }),
    })
  }

  // Fotos enviadas pelo painel. O nome de cada arquivo é único e nunca muda: o navegador pode guardar por 1 ano
  if (uploadsDir) {
    await app.register(fastifyStatic, { root: uploadsDir, prefix: '/uploads/', maxAge: '365d', immutable: true, index: false })
  }

  await app.register(healthRoutes, { checkHealth: useCases.checkHealth })
  await app.register(catalogRoutes, {
    listProducts: useCases.listProducts,
    getProduct: useCases.getProduct,
    listBanners: useCases.listBanners,
  })
  await app.register(orderRoutes, {
    getCoupon: useCases.getCoupon,
    quoteShipping: useCases.quoteShipping,
    placeOrder: useCases.placeOrder,
  })
  await app.register(engagementRoutes, {
    listProductReviews: useCases.listProductReviews,
    submitReview: useCases.submitReview,
    subscribeToNewsletter: useCases.subscribeToNewsletter,
  })
  await app.register(accountRoutes, {
    registerCustomer: useCases.registerCustomer,
    loginCustomer: useCases.loginCustomer,
    logoutCustomer: useCases.logoutCustomer,
    requestPasswordReset: useCases.requestPasswordReset,
    resetPassword: useCases.resetPassword,
    updateProfile: useCases.updateProfile,
    listCustomerOrders: useCases.listCustomerOrders,
  })
  if (useCases.admin) await app.register(adminRoutes, { prefix: '/admin', ...useCases.admin })

  return app
}
