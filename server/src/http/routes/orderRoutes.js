import { getCouponSchema, placeOrderSchema } from '../schemas/orderSchemas.js'

// Erro do caso de uso → status HTTP + mensagem para o cliente.
// 422: dados que não fazem sentido; 409: algo mudou desde que o cliente abriu a página (estoque, preço).
const ORDER_ERRORS = {
  empty_cart: [422, 'A sacola está vazia.'],
  invalid_data: [422, 'Confira os dados informados.'],
  product_not_found: [422, 'Um dos produtos não está mais disponível.'],
  invalid_item: [422, 'Confira tamanho, cor e quantidade dos produtos.'],
  invalid_coupon: [422, 'Cupom inválido ou expirado.'],
  coupon_min_subtotal: [422, 'O valor mínimo da compra para este cupom não foi atingido.'],
  out_of_stock: [409, 'Um dos produtos não tem estoque suficiente.'],
  price_changed: [409, 'Os valores mudaram desde que a página foi aberta. Confira o novo total.'],
}

/**
 * Rotas de compra:
 * - GET /coupons/:code → cupom ativo (404 se não existir)
 * - POST /orders → cria o pedido (201) com valores recalculados pelo servidor
 */
export async function orderRoutes(app, { getCoupon, placeOrder }) {
  app.get('/coupons/:code', { schema: getCouponSchema }, async (request, reply) => {
    const coupon = await getCoupon(request.params.code)
    if (!coupon) return reply.code(404).send({ error: 'coupon_not_found', message: 'Cupom inválido ou expirado.' })
    return coupon
  })

  // Até 10 tentativas de pedido por minuto por visitante
  const orderLimit = { rateLimit: { max: 10, timeWindow: '1 minute' } }

  app.post('/orders', { schema: placeOrderSchema, config: orderLimit }, async (request, reply) => {
    const { order, error, ...details } = await placeOrder(request.body)
    if (order) return reply.code(201).send(order)

    const [status, message] = ORDER_ERRORS[error]
    return reply.code(status).send({ error, message: details.message ?? message, ...details })
  })
}
