/*
 * Preenche o banco com catálogo, cupons e avaliações de exemplo (prisma/seed/*.json — os dados que antes ficavam nos mocks do front).
 * Rodar: `npm run db:seed`. Pode rodar de novo: atualiza o que já existe em vez de duplicar
 * (inclusive volta o estoque dos produtos ao valor do arquivo). Pedidos, avaliações enviadas pelo site e
 * inscritos na newsletter não são apagados.
 * Os dados passam pelas entidades do domínio, então um produto inválido para o seed com erro claro.
 */
import { readFileSync } from 'node:fs'
import { createBanner } from '../src/domain/entities/Banner.js'
import { createCoupon } from '../src/domain/entities/Coupon.js'
import { createProduct } from '../src/domain/entities/Product.js'
import { createReview } from '../src/domain/entities/Review.js'
import { createPrismaClient } from '../src/infrastructure/database/prismaClient.js'

const readJson = (file) => JSON.parse(readFileSync(new URL(`./seed/${file}`, import.meta.url), 'utf8'))

const products = readJson('products.json').map((data, position) => ({ ...createProduct(data), position }))
const banners = readJson('banners.json').map((data, position) => ({ ...createBanner(data), position }))
const coupons = readJson('coupons.json').map(createCoupon)
// Avaliação de exemplo: a data do arquivo vira a data de criação (meio-dia, para não mudar de dia no fuso)
const reviews = readJson('reviews.json').map((data) => {
  const { date, ...review } = createReview(data)
  return { ...review, createdAt: new Date(`${date}T12:00:00Z`) }
})

const prisma = createPrismaClient(process.env.DATABASE_URL)

try {
  // Tudo ou nada. Prazo largo: no banco da hospedagem cada gravação vai e volta pela internet,
  // e as ~130 passam do limite padrão de 5 segundos
  await prisma.$transaction(
    async (tx) => {
      for (const product of products) await tx.product.upsert({ where: { id: product.id }, create: product, update: product })
      for (const banner of banners) await tx.banner.upsert({ where: { id: banner.id }, create: banner, update: banner })
      for (const coupon of coupons) await tx.coupon.upsert({ where: { code: coupon.code }, create: coupon, update: coupon })
      for (const review of reviews) await tx.review.upsert({ where: { id: review.id }, create: review, update: review })
    },
    { maxWait: 20_000, timeout: 120_000 },
  )
  console.log(
    `Seed concluído: ${products.length} produtos, ${banners.length} banners, ${coupons.length} cupons e ${reviews.length} avaliações.`,
  )
} finally {
  await prisma.$disconnect()
}
