import { getProductSchema, listBannersSchema, listProductsSchema } from '../schemas/catalogSchemas.js'

/**
 * Rotas do catálogo (só leitura):
 * - GET /products?niche=moda&featured=true&onSale=true
 * - GET /products/:id
 * - GET /banners?placement=home
 */
export async function catalogRoutes(app, { listProducts, getProduct, listBanners }) {
  app.get('/products', { schema: listProductsSchema }, async (request) => {
    const { niche, featured, onSale } = request.query
    return listProducts({ niche, featured, onSale })
  })

  app.get('/products/:id', { schema: getProductSchema }, async (request, reply) => {
    const product = await getProduct(request.params.id)
    if (!product) return reply.code(404).send({ error: 'product_not_found', message: 'Produto não encontrado.' })
    return product
  })

  app.get('/banners', { schema: listBannersSchema }, async (request) => listBanners(request.query.placement))
}
