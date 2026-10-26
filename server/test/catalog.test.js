import assert from 'node:assert/strict'
import { test } from 'node:test'
import { makeGetProduct } from '../src/application/useCases/getProduct.js'
import { makeListBanners } from '../src/application/useCases/listBanners.js'
import { makeListProducts } from '../src/application/useCases/listProducts.js'
import { ALL_PAGES, createBanner } from '../src/domain/entities/Banner.js'
import { createProduct, isOnSale } from '../src/domain/entities/Product.js'
import { buildApp } from '../src/http/app.js'

// Repositórios em memória: testam rotas e casos de uso sem precisar do PostgreSQL
const products = [
  createProduct({ id: 'calca', name: 'Calça', niche: 'moda', category: 'Calças', price: 159.9, originalPrice: 199.9, isFeatured: true, stock: 3, image: 'calca.jpg' }),
  createProduct({ id: 'prato', name: 'Prato', niche: 'casa', category: 'Mesa', price: 29.9, stock: 10 }),
]
const productRepository = {
  findMany: async ({ niche, featured, onSale }) =>
    products.filter(
      (product) =>
        (!niche || product.niche === niche) && (!featured || product.isFeatured) && (!onSale || isOnSale(product)),
    ),
  findById: async (id) => products.find((product) => product.id === id) ?? null,
}

const banners = [
  createBanner({ id: 'geral', title: 'Geral', ctaLabel: 'Ver', ctaHref: '/' }),
  createBanner({ id: 'so-moda', placement: 'moda', title: 'Moda', ctaLabel: 'Ver', ctaHref: '/moda' }),
]
const bannerRepository = {
  findByPlacement: async (placement) => banners.filter((banner) => [placement, ALL_PAGES].includes(banner.placement)),
}

const app = await buildApp({
  corsOrigins: [],
  logger: false,
  useCases: {
    checkHealth: async () => ({}),
    listProducts: makeListProducts(productRepository),
    getProduct: makeGetProduct(productRepository),
    listBanners: makeListBanners(bannerRepository),
  },
})

const get = async (url) => {
  const response = await app.inject({ method: 'GET', url })
  return { status: response.statusCode, body: response.json() }
}

test('GET /products lista o catálogo inteiro', async () => {
  const { status, body } = await get('/products')
  assert.equal(status, 200)
  assert.deepEqual(body.map((product) => product.id), ['calca', 'prato'])
})

test('GET /products filtra por nicho, destaque e promoção', async () => {
  assert.deepEqual((await get('/products?niche=casa')).body.map((p) => p.id), ['prato'])
  assert.deepEqual((await get('/products?featured=true')).body.map((p) => p.id), ['calca'])
  assert.deepEqual((await get('/products?onSale=true')).body.map((p) => p.id), ['calca'])
})

test('GET /products recusa nicho inexistente e ignora filtros desconhecidos', async () => {
  assert.equal((await get('/products?niche=carros')).status, 400)

  const unknownFilter = await get('/products?preco=1')
  assert.equal(unknownFilter.status, 200)
  assert.equal(unknownFilter.body.length, 2)
})

test('GET /products/:id devolve o produto com preço em número', async () => {
  const { status, body } = await get('/products/calca')
  assert.equal(status, 200)
  assert.equal(body.price, 159.9)
  assert.equal(body.originalPrice, 199.9)
  assert.equal(body.image, 'calca.jpg')
})

test('GET /products/:id responde 404 para produto inexistente', async () => {
  const { status, body } = await get('/products/nao-existe')
  assert.equal(status, 404)
  assert.equal(body.error, 'product_not_found')
})

test('GET /banners traz os da página + os de todas as páginas', async () => {
  assert.deepEqual((await get('/banners?placement=moda')).body.map((b) => b.id), ['geral', 'so-moda'])
  assert.deepEqual((await get('/banners?placement=home')).body.map((b) => b.id), ['geral'])
})

test('GET /banners exige uma página válida', async () => {
  assert.equal((await get('/banners')).status, 400)
  assert.equal((await get('/banners?placement=xyz')).status, 400)
})
