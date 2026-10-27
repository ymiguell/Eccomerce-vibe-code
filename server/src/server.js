import { makeChangeOrderStatus } from './application/useCases/admin/changeOrderStatus.js'
import { makeCreateCoupon } from './application/useCases/admin/createCoupon.js'
import { makeCreateProduct } from './application/useCases/admin/createProduct.js'
import { makeListCoupons } from './application/useCases/admin/listCoupons.js'
import { makeListOrders } from './application/useCases/admin/listOrders.js'
import { makeListReviews } from './application/useCases/admin/listReviews.js'
import { makeListSubscribers } from './application/useCases/admin/listSubscribers.js'
import { makeRemoveSubscriber } from './application/useCases/admin/removeSubscriber.js'
import { makeSetCouponActive } from './application/useCases/admin/setCouponActive.js'
import { makeSetReviewHidden } from './application/useCases/admin/setReviewHidden.js'
import { makeSetTrackingCode } from './application/useCases/admin/setTrackingCode.js'
import { makeUpdateProduct } from './application/useCases/admin/updateProduct.js'
import { makeUploadProductImage } from './application/useCases/admin/uploadProductImage.js'
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
import { makeQuoteShipping } from './application/useCases/quoteShipping.js'
import { makeRegisterCustomer } from './application/useCases/registerCustomer.js'
import { makeRequestPasswordReset } from './application/useCases/requestPasswordReset.js'
import { makeResetPassword } from './application/useCases/resetPassword.js'
import { makeSubmitReview } from './application/useCases/submitReview.js'
import { makeSubscribeToNewsletter } from './application/useCases/subscribeToNewsletter.js'
import { makeUpdateProfile } from './application/useCases/updateProfile.js'
import { loadConfig } from './config/env.js'
import { buildApp } from './http/app.js'
import { PrismaDatabaseStatus } from './infrastructure/database/PrismaDatabaseStatus.js'
import { createPrismaClient } from './infrastructure/database/prismaClient.js'
import { BrevoEmailSender } from './infrastructure/email/BrevoEmailSender.js'
import { ConsoleEmailSender } from './infrastructure/email/ConsoleEmailSender.js'
import { PrismaBannerRepository } from './infrastructure/repositories/PrismaBannerRepository.js'
import { PrismaCouponRepository } from './infrastructure/repositories/PrismaCouponRepository.js'
import { PrismaCustomerRepository } from './infrastructure/repositories/PrismaCustomerRepository.js'
import { PrismaNewsletterRepository } from './infrastructure/repositories/PrismaNewsletterRepository.js'
import { PrismaOrderRepository } from './infrastructure/repositories/PrismaOrderRepository.js'
import { PrismaProductRepository } from './infrastructure/repositories/PrismaProductRepository.js'
import { PrismaPasswordResetRepository } from './infrastructure/repositories/PrismaPasswordResetRepository.js'
import { PrismaReviewRepository } from './infrastructure/repositories/PrismaReviewRepository.js'
import { PrismaSessionRepository } from './infrastructure/repositories/PrismaSessionRepository.js'
import { ScryptPasswordHasher } from './infrastructure/security/ScryptPasswordHasher.js'
import { MelhorEnvioShippingQuoter } from './infrastructure/shipping/MelhorEnvioShippingQuoter.js'
import { TableShippingQuoter } from './infrastructure/shipping/TableShippingQuoter.js'
import { CloudinaryImageStorage } from './infrastructure/storage/CloudinaryImageStorage.js'
import { LocalImageStorage } from './infrastructure/storage/LocalImageStorage.js'

// Composição: liga a infraestrutura (banco) aos casos de uso e sobe a API. É o "App.jsx" do servidor.
const config = loadConfig()
const prisma = createPrismaClient(config.databaseUrl)
const productRepository = new PrismaProductRepository(prisma)
const couponRepository = new PrismaCouponRepository(prisma)
const reviewRepository = new PrismaReviewRepository(prisma)
const orderRepository = new PrismaOrderRepository(prisma)
const newsletterRepository = new PrismaNewsletterRepository(prisma)
const accounts = {
  customerRepository: new PrismaCustomerRepository(prisma),
  sessionRepository: new PrismaSessionRepository(prisma),
  passwordHasher: new ScryptPasswordHasher(),
  passwordResetRepository: new PrismaPasswordResetRepository(prisma),
}
// Fotos do painel: no Cloudinary quando configurado (hospedagem); senão numa pasta do servidor (ambiente local)
const imageStorage = config.cloudinaryUrl
  ? new CloudinaryImageStorage({ cloudinaryUrl: config.cloudinaryUrl })
  : new LocalImageStorage({ directory: config.uploadsDir, publicUrl: `${config.publicUrl}/uploads` })
// E-mails pelo Brevo quando configurado (hospedagem); senão aparecem no terminal (ambiente local)
const emailSender = config.brevoApiKey
  ? new BrevoEmailSender({ apiKey: config.brevoApiKey, sender: config.emailFrom })
  : new ConsoleEmailSender()
// Frete pelo Melhor Envio quando configurado (hospedagem); senão pela tabela da loja (ambiente local)
const shippingQuoter = config.melhorEnvioToken
  ? new MelhorEnvioShippingQuoter({
      token: config.melhorEnvioToken,
      fromCep: config.storeCep,
      sandbox: config.melhorEnvioSandbox,
      ...(config.melhorEnvioServices?.length && { services: config.melhorEnvioServices }),
      contactEmail: config.emailFrom.email,
    })
  : new TableShippingQuoter()

const useCases = {
  checkHealth: makeCheckHealth(new PrismaDatabaseStatus(prisma)),
  // Catálogo
  listProducts: makeListProducts(productRepository),
  getProduct: makeGetProduct(productRepository),
  listBanners: makeListBanners(new PrismaBannerRepository(prisma)),
  // Compra
  getCoupon: makeGetCoupon(couponRepository),
  quoteShipping: makeQuoteShipping({ productRepository, shippingQuoter }),
  placeOrder: makePlaceOrder({ productRepository, couponRepository, orderRepository, shippingQuoter }),
  // Avaliações e newsletter
  listProductReviews: makeListProductReviews(reviewRepository),
  submitReview: makeSubmitReview({ productRepository, reviewRepository }),
  subscribeToNewsletter: makeSubscribeToNewsletter(newsletterRepository),
  // Contas
  authenticate: makeAuthenticate(accounts.sessionRepository),
  registerCustomer: makeRegisterCustomer(accounts),
  loginCustomer: makeLoginCustomer(accounts),
  logoutCustomer: makeLogoutCustomer(accounts.sessionRepository),
  requestPasswordReset: makeRequestPasswordReset({ ...accounts, emailSender, siteUrl: config.siteUrl }),
  resetPassword: makeResetPassword(accounts),
  updateProfile: makeUpdateProfile(accounts.customerRepository),
  listCustomerOrders: makeListCustomerOrders(orderRepository),
  // Painel da loja (/admin): só contas da equipe
  admin: {
    listOrders: makeListOrders(orderRepository),
    changeOrderStatus: makeChangeOrderStatus(orderRepository),
    setTrackingCode: makeSetTrackingCode(orderRepository),
    uploadProductImage: makeUploadProductImage(imageStorage),
    createProduct: makeCreateProduct({ productRepository, imageStorage }),
    updateProduct: makeUpdateProduct(productRepository, imageStorage),
    listCoupons: makeListCoupons(couponRepository),
    createCoupon: makeCreateCoupon(couponRepository),
    setCouponActive: makeSetCouponActive(couponRepository),
    listReviews: makeListReviews(reviewRepository),
    setReviewHidden: makeSetReviewHidden(reviewRepository),
    listSubscribers: makeListSubscribers(newsletterRepository),
    removeSubscriber: makeRemoveSubscriber(newsletterRepository),
  },
}

const app = await buildApp({
  corsOrigins: config.corsOrigins,
  trustProxy: config.trustProxy,
  uploadsDir: config.cloudinaryUrl ? null : config.uploadsDir,
  useCases,
})

// Ao parar o servidor (Ctrl+C ou novo deploy), termina as requisições em andamento e fecha o banco
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  })
}

await app.listen({ port: config.port, host: config.host })
