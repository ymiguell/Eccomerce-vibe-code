import { requireCustomer } from '../authentication.js'
import { loginSchema, meSchema, myOrdersSchema, registerSchema, updateMeSchema } from '../schemas/accountSchemas.js'

// Cadastro e login: poucas tentativas por minuto por visitante, para dificultar adivinhar senhas
const perMinute = (max) => ({ rateLimit: { max, timeWindow: '1 minute' } })

/**
 * Rotas de conta:
 * - POST  /auth/register → cria a conta e já entra (201 { customer, token }); 409 email_taken
 * - POST  /auth/login    → entra (200 { customer, token }); 401 invalid_credentials
 * - POST  /auth/logout   → sai: apaga a sessão (204)
 * - GET   /me            → dados da conta logada
 * - PATCH /me            → atualiza nome e celular
 * - GET   /me/orders     → pedidos feitos com a conta
 */
export async function accountRoutes(
  app,
  { registerCustomer, loginCustomer, logoutCustomer, updateProfile, listCustomerOrders },
) {
  app.post('/auth/register', { schema: registerSchema, config: perMinute(5) }, async (request, reply) => {
    const { customer, token, error, fields } = await registerCustomer(request.body)
    if (customer) return reply.code(201).send({ customer, token })
    if (error === 'email_taken') {
      return reply.code(409).send({ error, message: 'Já existe uma conta com este e-mail. Tente entrar.' })
    }
    return reply.code(422).send({ error, message: 'Confira os dados do cadastro.', fields })
  })

  app.post('/auth/login', { schema: loginSchema, config: perMinute(10) }, async (request, reply) => {
    const { customer, token } = await loginCustomer(request.body)
    if (customer) return { customer, token }
    return reply.code(401).send({ error: 'invalid_credentials', message: 'E-mail ou senha incorretos.' })
  })

  app.post('/auth/logout', async (request, reply) => {
    if (request.sessionToken) await logoutCustomer(request.sessionToken)
    return reply.code(204).send()
  })

  app.get('/me', { schema: meSchema, preHandler: requireCustomer }, async (request) => request.customer)

  app.patch('/me', { schema: updateMeSchema, preHandler: requireCustomer }, async (request, reply) => {
    const { customer, error, fields } = await updateProfile(request.customer.id, request.body)
    if (customer) return customer
    return reply.code(422).send({ error, message: 'Confira os dados do perfil.', fields })
  })

  app.get('/me/orders', { schema: myOrdersSchema, preHandler: requireCustomer }, async (request) =>
    listCustomerOrders(request.customer.id),
  )
}
