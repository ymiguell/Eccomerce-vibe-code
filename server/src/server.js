import { makeAuthenticate } from './application/useCases/authenticate.js'
import { makeCheckHealth } from './application/useCases/checkHealth.js'
import { makeGetCoupon } from './application/useCases/getCoupon.js'
import { makeGetProduct } from './application/useCases/getProduct.js'
import { makeListProductReviews } from './application/useCases/listProductReviews.js'
import { makeListBanners } from './application/useCases/listBanners.js'
import { makeListCustomerOrders } from './application/useCases/listCustomerOrders.js'
import { makeListProducts } from './application/useCases/listProducts.js'
import { makeLoginCustomer } from './application/useCases/loginCustomer.js'
import { makeLogoutCustomer } from './application/useCases/logoutCustomer.js'
import { makePlaceOrder } from './application/useCases/placeOrder.js'
import { makeRegisterCustomer } from './application/useCases/registerCustomer.js'
import { makeSubmitReview } from './application/useCases/submitReview.js'
import { makeSubscribeToNewsletter } from './application/useCases/subscribeToNewsletter.js'
import { makeUpdateProfile } from './application/useCases/updateProfile.js'
import { loadConfig } from './config/env.js'
import { buildApp } from './http/app.js'
import { PrismaDatabaseStatus } from './infrastructure/database/PrismaDatabaseStatus.js'
import { createPrismaClient } from './infrastructure/database/prismaClient.js'
import { PrismaBannerRepository } from './infrastructure/repositories/PrismaBannerRepository.js'
import { PrismaCouponRepository } from './infrastructure/repositories/PrismaCouponRepository.js'
import { PrismaCustomerRepository } from './infrastructure/repositories/PrismaCustomerRepository.js'
import { PrismaNewsletterRepository } from './infrastructure/repositories/PrismaNewsletterRepository.js'
import { PrismaOrderRepository } from './infrastructure/repositories/PrismaOrderRepository.js'
import { PrismaProductRepository } from './infrastructure/repositories/PrismaProductRepository.js'
import { PrismaReviewRepository } from './infrastructure/repositories/PrismaReviewRepository.js'
import { PrismaSessionRepository } from './infrastructure/repositories/PrismaSessionRepository.js'
import { ScryptPasswordHasher } from './infrastructure/security/ScryptPasswordHasher.js'

// Composição: liga a infraestrutura (banco) aos casos de uso e sobe a API. É o "App.jsx" do servidor.
const config = loadConfig()
const prisma = createPrismaClient(config.databaseUrl)
const productRepository = new PrismaProductRepository(prisma)
const couponRepository = new PrismaCouponRepository(prisma)
const reviewRepository = new PrismaReviewRepository(prisma)
const orderRepository = new PrismaOrderRepository(prisma)
const accounts = {
  customerRepository: new PrismaCustomerRepository(prisma),
  sessionRepository: new PrismaSessionRepository(prisma),
  passwordHasher: new ScryptPasswordHasher(),
}

const useCases = {
  checkHealth: makeCheckHealth(new PrismaDatabaseStatus(prisma)),
  // Catálogo
  listProducts: makeListProducts(productRepository),
  getProduct: makeGetProduct(productRepository),
  listBanners: makeListBanners(new PrismaBannerRepository(prisma)),
  // Compra
  getCoupon: makeGetCoupon(couponRepository),
  placeOrder: makePlaceOrder({ productRepository, couponRepository, orderRepository }),
  // Avaliações e newsletter
  listProductReviews: makeListProductReviews(reviewRepository),
  submitReview: makeSubmitReview({ productRepository, reviewRepository }),
  subscribeToNewsletter: makeSubscribeToNewsletter(new PrismaNewsletterRepository(prisma)),
  // Contas
  authenticate: makeAuthenticate(accounts.sessionRepository),
  registerCustomer: makeRegisterCustomer(accounts),
  loginCustomer: makeLoginCustomer(accounts),
  logoutCustomer: makeLogoutCustomer(accounts.sessionRepository),
  updateProfile: makeUpdateProfile(accounts.customerRepository),
  listCustomerOrders: makeListCustomerOrders(orderRepository),
}

const app = await buildApp({ corsOrigins: config.corsOrigins, trustProxy: config.trustProxy, useCases })

// Ao parar o servidor (Ctrl+C ou novo deploy), termina as requisições em andamento e fecha o banco
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  })
}

await app.listen({ port: config.port, host: config.host })
