/*
 * Preenche o banco com o catálogo e os cupons iniciais (prisma/seed/*.json — os dados que antes ficavam nos mocks do front).
 * Rodar: `npm run db:seed`. Pode rodar de novo: atualiza o que já existe em vez de duplicar
 * (inclusive volta o estoque dos produtos ao valor do arquivo). Pedidos não são apagados.
 * Os dados passam pelas entidades do domínio, então um produto inválido para o seed com erro claro.
 */
import { readFileSync } from 'node:fs'
import { createBanner } from '../src/domain/entities/Banner.js'
import { createCoupon } from '../src/domain/entities/Coupon.js'
import { createProduct } from '../src/domain/entities/Product.js'
import { createPrismaClient } from '../src/infrastructure/database/prismaClient.js'

const readJson = (file) => JSON.parse(readFileSync(new URL(`./seed/${file}`, import.meta.url), 'utf8'))

const products = readJson('products.json').map((data, position) => ({ ...createProduct(data), position }))
const banners = readJson('banners.json').map((data, position) => ({ ...createBanner(data), position }))
const coupons = readJson('coupons.json').map(createCoupon)

const prisma = createPrismaClient(process.env.DATABASE_URL)

try {
  await prisma.$transaction([
    ...products.map((product) =>
      prisma.product.upsert({ where: { id: product.id }, create: product, update: product }),
    ),
    ...banners.map((banner) => prisma.banner.upsert({ where: { id: banner.id }, create: banner, update: banner })),
    ...coupons.map((coupon) => prisma.coupon.upsert({ where: { code: coupon.code }, create: coupon, update: coupon })),
  ])
  console.log(`Seed concluído: ${products.length} produtos, ${banners.length} banners e ${coupons.length} cupons.`)
} finally {
  await prisma.$disconnect()
}
