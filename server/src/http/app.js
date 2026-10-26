import cors from '@fastify/cors'
import Fastify from 'fastify'
import { catalogRoutes } from './routes/catalogRoutes.js'
import { healthRoutes } from './routes/healthRoutes.js'
import { orderRoutes } from './routes/orderRoutes.js'

/**
 * Monta a API: CORS, rotas e respostas de erro padronizadas.
 * Recebe os casos de uso prontos (ver server.js), então os testes podem passar versões falsas.
 */
export async function buildApp({ corsOrigins, useCases, logger = true }) {
  const app = Fastify({ logger })

  // Só o site da loja (e o ambiente local) pode chamar a API pelo navegador
  await app.register(cors, { origin: corsOrigins })

  await app.register(healthRoutes, { checkHealth: useCases.checkHealth })
  await app.register(catalogRoutes, {
    listProducts: useCases.listProducts,
    getProduct: useCases.getProduct,
    listBanners: useCases.listBanners,
  })
  await app.register(orderRoutes, { getCoupon: useCases.getCoupon, placeOrder: useCases.placeOrder })

  // Erros sempre no mesmo formato: { error: código, message: texto para o usuário }
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

  return app
}
