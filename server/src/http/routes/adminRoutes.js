import { requireAdmin } from '../authentication.js'
import {
  changeOrderStatusSchema,
  createCouponSchema,
  listCouponsSchema,
  listOrdersSchema,
  setCouponActiveSchema,
  updateProductSchema,
} from '../schemas/adminSchemas.js'

// Erro do caso de uso → status HTTP + mensagem para a equipe
const ADMIN_ERRORS = {
  order_not_found: [404, 'Pedido não encontrado.'],
  invalid_transition: [422, 'O pedido não pode ir para esta situação.'],
  status_changed: [409, 'O pedido mudou enquanto a tela estava aberta. Atualize a lista.'],
  product_not_found: [404, 'Produto não encontrado.'],
  coupon_not_found: [404, 'Cupom não encontrado.'],
  code_taken: [409, 'Já existe um cupom com este código.'],
  invalid_data: [422, 'Confira os dados informados.'],
}

const sendError = (reply, { error, fields }) => {
  const [status, message] = ADMIN_ERRORS[error]
  return reply.code(status).send({ error, message, ...(fields && { fields }) })
}

/**
 * Painel da loja (registrado com prefixo /admin). Toda rota exige conta da equipe (isAdmin):
 * - GET   /admin/orders?status=&page=  → página de pedidos + quantos há em cada situação
 * - PATCH /admin/orders/:id            → muda a situação ({ status }); cancelar devolve o estoque
 * - PATCH /admin/products/:id          → preço, preço original, estoque e destaque
 * - GET   /admin/coupons               → todos os cupons
 * - POST  /admin/coupons               → cria um cupom (201)
 * - PATCH /admin/coupons/:code         → liga ou desliga ({ active })
 */
export async function adminRoutes(
  app,
  { listOrders, changeOrderStatus, updateProduct, listCoupons, createCoupon, setCouponActive },
) {
  // onRequest: confere o acesso antes de qualquer outra coisa (até antes de validar o corpo)
  app.addHook('onRequest', requireAdmin)

  app.get('/orders', { schema: listOrdersSchema }, async (request) => listOrders(request.query))

  app.patch('/orders/:id', { schema: changeOrderStatusSchema }, async (request, reply) => {
    const result = await changeOrderStatus(request.params.id, request.body.status)
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
}
