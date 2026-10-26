import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import Fastify from 'fastify'
import { addAuthentication } from './authentication.js'
import { accountRoutes } from './routes/accountRoutes.js'
import { catalogRoutes } from './routes/catalogRoutes.js'
import { engagementRoutes } from './routes/engagementRoutes.js'
import { healthRoutes } from './routes/healthRoutes.js'
import { orderRoutes } from './routes/orderRoutes.js'

/**
 * Monta a API: CORS, limite de envios, respostas de erro padronizadas e rotas.
 * Recebe os casos de uso prontos (ver server.js), então os testes podem passar versões falsas.
 * - `trustProxy`: true na hospedagem (atrás de proxy), para o limite por visitante usar o IP real.
 * - `rateLimits`: false nos testes que fazem muitas requisições seguidas.
 */
export async function buildApp({ corsOrigins, useCases, logger = true, trustProxy = false, rateLimits = true }) {
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
  await app.register(cors, { origin: corsOrigins, methods: ['GET', 'HEAD', 'POST', 'PATCH'] })

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

  await app.register(healthRoutes, { checkHealth: useCases.checkHealth })
  await app.register(catalogRoutes, {
    listProducts: useCases.listProducts,
    getProduct: useCases.getProduct,
    listBanners: useCases.listBanners,
  })
  await app.register(orderRoutes, { getCoupon: useCases.getCoupon, placeOrder: useCases.placeOrder })
  await app.register(engagementRoutes, {
    listProductReviews: useCases.listProductReviews,
    submitReview: useCases.submitReview,
    subscribeToNewsletter: useCases.subscribeToNewsletter,
  })
  await app.register(accountRoutes, {
    registerCustomer: useCases.registerCustomer,
    loginCustomer: useCases.loginCustomer,
    logoutCustomer: useCases.logoutCustomer,
    updateProfile: useCases.updateProfile,
    listCustomerOrders: useCases.listCustomerOrders,
  })

  return app
}
