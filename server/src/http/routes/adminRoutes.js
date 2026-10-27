import { requireAdmin } from '../authentication.js'
import {
  changeOrderStatusSchema,
  createCouponSchema,
  listCouponsSchema,
  listOrdersSchema,
  listReviewsSchema,
  listSubscribersSchema,
  removeSubscriberSchema,
  setCouponActiveSchema,
  setReviewHiddenSchema,
  setTrackingCodeSchema,
  updateProductSchema,
} from '../schemas/adminSchemas.js'

// Erro do caso de uso → status HTTP + mensagem para a equipe
const ADMIN_ERRORS = {
  order_not_found: [404, 'Pedido não encontrado.'],
  invalid_transition: [422, 'O pedido não pode ir para esta situação.'],
  not_shipped: [422, 'O pedido ainda não foi enviado.'],
  status_changed: [409, 'O pedido mudou enquanto a tela estava aberta. Atualize a lista.'],
  product_not_found: [404, 'Produto não encontrado.'],
  coupon_not_found: [404, 'Cupom não encontrado.'],
  code_taken: [409, 'Já existe um cupom com este código.'],
  review_not_found: [404, 'Avaliação não encontrada.'],
  subscriber_not_found: [404, 'Este e-mail não está na lista.'],
  invalid_data: [422, 'Confira os dados informados.'],
}

const sendError = (reply, { error, fields }) => {
  const [status, message] = ADMIN_ERRORS[error]
  return reply.code(status).send({ error, message, ...(fields && { fields }) })
}

/**
 * Painel da loja (registrado com prefixo /admin). Toda rota exige conta da equipe (isAdmin):
 * - GET   /admin/orders?status=&page=  → página de pedidos + quantos há em cada situação
 * - PATCH /admin/orders/:id            → muda a situação ({ status, trackingCode? }); cancelar devolve o estoque
 * - PATCH /admin/orders/:id/tracking   → informa ou corrige o código de rastreio de pedido enviado
 * - PATCH /admin/products/:id          → preço, preço original, estoque e destaque
 * - GET   /admin/coupons               → todos os cupons
 * - POST  /admin/coupons               → cria um cupom (201)
 * - PATCH /admin/coupons/:code         → liga ou desliga ({ active })
 * - GET   /admin/reviews?visibility=&page= → avaliações de todos os produtos + quantas visíveis/ocultas
 * - PATCH /admin/reviews/:id           → oculta ou mostra ({ hidden })
 * - GET   /admin/newsletter            → inscritos na newsletter
 * - DELETE /admin/newsletter/:email    → tira o e-mail da lista (204)
 */
export async function adminRoutes(
  app,
  {
    listOrders,
    changeOrderStatus,
    setTrackingCode,
    updateProduct,
    listCoupons,
    createCoupon,
    setCouponActive,
    listReviews,
    setReviewHidden,
    listSubscribers,
    removeSubscriber,
  },
) {
  // onRequest: confere o acesso antes de qualquer outra coisa (até antes de validar o corpo)
  app.addHook('onRequest', requireAdmin)

  app.get('/orders', { schema: listOrdersSchema }, async (request) => listOrders(request.query))

  app.patch('/orders/:id', { schema: changeOrderStatusSchema }, async (request, reply) => {
    const { status, trackingCode } = request.body
    const result = await changeOrderStatus(request.params.id, status, { trackingCode })
    return result.order ?? sendError(reply, result)
  })

  app.patch('/orders/:id/tracking', { schema: setTrackingCodeSchema }, async (request, reply) => {
    const result = await setTrackingCode(request.params.id, request.body.trackingCode)
    return result.order ?? sendError(reply, result)
  })

  app.patch('/products/:id', { schema: updateProductSchema }, async (request, reply) => {
    const result = await updateProduct(request.params.id, request.body)
    return result.product ?? sendError(reply, result)
  })

  app.get('/coupons', { schema: listCouponsSchema }, async () => listCoupons())

  app.post('/coupons', { schema: createCouponSchema }, async (request, reply) => {
    const result = await createCoupon(request.body)
    if (result.coupon) return reply.code(201).send(result.coupon)
    return sendError(reply, result)
  })

  app.patch('/coupons/:code', { schema: setCouponActiveSchema }, async (request, reply) => {
    const result = await setCouponActive(request.params.code, request.body.active)
    return result.coupon ?? sendError(reply, result)
  })

  app.get('/reviews', { schema: listReviewsSchema }, async (request) => listReviews(request.query))

  app.patch('/reviews/:id', { schema: setReviewHiddenSchema }, async (request, reply) => {
    const result = await setReviewHidden(request.params.id, request.body.hidden)
    return result.review ?? sendError(reply, result)
  })

  app.get('/newsletter', { schema: listSubscribersSchema }, async () => listSubscribers())

  app.delete('/newsletter/:email', { schema: removeSubscriberSchema }, async (request, reply) => {
    const result = await removeSubscriber(request.params.email)
    return result.removed ? reply.code(204).send() : sendError(reply, result)
  })
}
