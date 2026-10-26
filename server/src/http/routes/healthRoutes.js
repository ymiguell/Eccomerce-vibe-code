/** GET /health → 200 quando está tudo certo; 503 quando o banco não responde. */
export async function healthRoutes(app, { checkHealth }) {
  app.get('/health', async (request, reply) => {
    const health = await checkHealth()
    return reply.code(health.database === 'up' ? 200 : 503).send(health)
  })
}
