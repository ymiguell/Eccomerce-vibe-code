/*
 * Login nas rotas: o site manda o token de sessão no cabeçalho "Authorization: Bearer <token>".
 * Em toda requisição, se o cabeçalho vier, `request.customer` passa a ter a conta (ou fica null se o token
 * não vale). Rotas que exigem login usam `requireCustomer`.
 */

export function addAuthentication(app, authenticate) {
  app.decorateRequest('customer', null)
  app.decorateRequest('sessionToken', null)

  app.addHook('onRequest', async (request) => {
    const [scheme, token] = (request.headers.authorization ?? '').split(' ')
    if (scheme !== 'Bearer' || !token) return

    request.sessionToken = token
    request.customer = await authenticate(token)
  })
}

/** preHandler das rotas que só funcionam logado: 401 se não há conta válida. */
export async function requireCustomer(request, reply) {
  if (!request.customer) {
    return reply.code(401).send({ error: 'unauthorized', message: 'Entre na sua conta para continuar.' })
  }
}

/** Rotas do painel: 401 sem login; 403 se a conta não é da equipe da loja. */
export async function requireAdmin(request, reply) {
  if (!request.customer) return requireCustomer(request, reply)
  if (!request.customer.isAdmin) {
    return reply.code(403).send({ error: 'forbidden', message: 'Esta área é só para a equipe da loja.' })
  }
}
