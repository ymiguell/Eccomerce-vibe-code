import { makeCheckHealth } from './application/useCases/checkHealth.js'
import { makeGetCoupon } from './application/useCases/getCoupon.js'
import { makeGetProduct } from './application/useCases/getProduct.js'
import { makeListBanners } from './application/useCases/listBanners.js'
import { makeListProducts } from './application/useCases/listProducts.js'
import { makePlaceOrder } from './application/useCases/placeOrder.js'
import { loadConfig } from './config/env.js'
import { buildApp } from './http/app.js'
import { PrismaDatabaseStatus } from './infrastructure/database/PrismaDatabaseStatus.js'
import { createPrismaClient } from './infrastructure/database/prismaClient.js'
import { PrismaBannerRepository } from './infrastructure/repositories/PrismaBannerRepository.js'
import { PrismaCouponRepository } from './infrastructure/repositories/PrismaCouponRepository.js'
import { PrismaOrderRepository } from './infrastructure/repositories/PrismaOrderRepository.js'
import { PrismaProductRepository } from './infrastructure/repositories/PrismaProductRepository.js'

// Composição: liga a infraestrutura (banco) aos casos de uso e sobe a API. É o "App.jsx" do servidor.
const config = loadConfig()
const prisma = createPrismaClient(config.databaseUrl)
const productRepository = new PrismaProductRepository(prisma)
const couponRepository = new PrismaCouponRepository(prisma)

const useCases = {
  checkHealth: makeCheckHealth(new PrismaDatabaseStatus(prisma)),
  // Catálogo
  listProducts: makeListProducts(productRepository),
  getProduct: makeGetProduct(productRepository),
  listBanners: makeListBanners(new PrismaBannerRepository(prisma)),
  // Compra
  getCoupon: makeGetCoupon(couponRepository),
  placeOrder: makePlaceOrder({ productRepository, couponRepository, orderRepository: new PrismaOrderRepository(prisma) }),
}

const app = await buildApp({ corsOrigins: config.corsOrigins, useCases })

// Ao parar o servidor (Ctrl+C ou novo deploy), termina as requisições em andamento e fecha o banco
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  })
}

await app.listen({ port: config.port, host: config.host })
