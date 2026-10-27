import { useCallback, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { makeChangeOrderStatus } from './application/useCases/admin/changeOrderStatus.js'
import { makeCreateCoupon } from './application/useCases/admin/createCoupon.js'
import { makeGetAdminOrders } from './application/useCases/admin/getAdminOrders.js'
import { makeGetAdminReviews } from './application/useCases/admin/getAdminReviews.js'
import { makeGetCoupons } from './application/useCases/admin/getCoupons.js'
import { makeGetInventory } from './application/useCases/admin/getInventory.js'
import { makeGetSubscribers } from './application/useCases/admin/getSubscribers.js'
import { makeRemoveSubscriber } from './application/useCases/admin/removeSubscriber.js'
import { makeSetCouponActive } from './application/useCases/admin/setCouponActive.js'
import { makeSetReviewHidden } from './application/useCases/admin/setReviewHidden.js'
import { makeSetTrackingCode } from './application/useCases/admin/setTrackingCode.js'
import { makeUpdateProduct } from './application/useCases/admin/updateProduct.js'
import { makeApplyCoupon } from './application/useCases/applyCoupon.js'
import { makeGetBanners } from './application/useCases/getBanners.js'
import { makeEstimateShipping } from './application/useCases/estimateShipping.js'
import { makeFindAddressByCep } from './application/useCases/findAddressByCep.js'
import { makeGetCart } from './application/useCases/getCart.js'
import { makeGetCurrentCustomer } from './application/useCases/getCurrentCustomer.js'
import { makeGetFeaturedProducts } from './application/useCases/getFeaturedProducts.js'
import { makeGetMyOrders } from './application/useCases/getMyOrders.js'
import { makeGetProducts } from './application/useCases/getProducts.js'
import { makeGetSavedAddress } from './application/useCases/getSavedAddress.js'
import { makeGetOnSaleProducts } from './application/useCases/getOnSaleProducts.js'
import { makeGetProductById } from './application/useCases/getProductById.js'
import { makeGetProductReviews } from './application/useCases/getProductReviews.js'
import { makeGetProductsByNiche } from './application/useCases/getProductsByNiche.js'
import { makeGetRelatedProducts } from './application/useCases/getRelatedProducts.js'
import { makeLoginCustomer } from './application/useCases/loginCustomer.js'
import { makeLogoutCustomer } from './application/useCases/logoutCustomer.js'
import { makePlaceOrder } from './application/useCases/placeOrder.js'
import { makeRegisterCustomer } from './application/useCases/registerCustomer.js'
import { makeSaveCart } from './application/useCases/saveCart.js'
import { makeSubmitReview } from './application/useCases/submitReview.js'
import { makeSubscribeToNewsletter } from './application/useCases/subscribeToNewsletter.js'
import { makeUpdateProfile } from './application/useCases/updateProfile.js'
import { createApiClient } from './infrastructure/http/apiClient.js'
import { HttpAccountRepository } from './infrastructure/repositories/HttpAccountRepository.js'
import { HttpAdminRepository } from './infrastructure/repositories/HttpAdminRepository.js'
import { HttpBannerRepository } from './infrastructure/repositories/HttpBannerRepository.js'
import { HttpCouponRepository } from './infrastructure/repositories/HttpCouponRepository.js'
import { HttpNewsletterRepository } from './infrastructure/repositories/HttpNewsletterRepository.js'
import { HttpOrderRepository } from './infrastructure/repositories/HttpOrderRepository.js'
import { HttpProductRepository } from './infrastructure/repositories/HttpProductRepository.js'
import { HttpReviewRepository } from './infrastructure/repositories/HttpReviewRepository.js'
import { LocalStorageCartRepository } from './infrastructure/repositories/LocalStorageCartRepository.js'
import { MockBannerRepository } from './infrastructure/repositories/MockBannerRepository.js'
import { MockCouponRepository } from './infrastructure/repositories/MockCouponRepository.js'
import { MockNewsletterRepository } from './infrastructure/repositories/MockNewsletterRepository.js'
import { MockOrderRepository } from './infrastructure/repositories/MockOrderRepository.js'
import { MockProductRepository } from './infrastructure/repositories/MockProductRepository.js'
import { MockReviewRepository } from './infrastructure/repositories/MockReviewRepository.js'
import { ViaCepAddressLookup } from './infrastructure/services/ViaCepAddressLookup.js'
import { LocalStorageSessionStore } from './infrastructure/storage/LocalStorageSessionStore.js'
import AnnouncementBar from './presentation/components/AnnouncementBar.jsx'
import Cart from './presentation/components/Cart.jsx'
import Footer from './presentation/components/Footer.jsx'
import NavBar from './presentation/components/NavBar.jsx'
import { AuthContext } from './presentation/context/authContext.js'
import { CartContext } from './presentation/context/cartContext.js'
import { useAuth } from './presentation/hooks/useAuth.js'
import { useCart } from './presentation/hooks/useCart.js'
import { useScrollOnNavigate } from './presentation/hooks/useScrollOnNavigate.js'
import { INFO_PAGES } from './presentation/content/infoPages.js'
import AccountPage from './presentation/pages/AccountPage.jsx'
import AdminPage from './presentation/pages/AdminPage.jsx'
import CheckoutPage from './presentation/pages/CheckoutPage.jsx'
import HomePage from './presentation/pages/HomePage.jsx'
import InfoPage from './presentation/pages/InfoPage.jsx'
import LoginPage from './presentation/pages/LoginPage.jsx'
import NichePage from './presentation/pages/NichePage.jsx'
import OrderConfirmationPage from './presentation/pages/OrderConfirmationPage.jsx'
import OutletPage from './presentation/pages/OutletPage.jsx'
import ProductPage from './presentation/pages/ProductPage.jsx'
import RegisterPage from './presentation/pages/RegisterPage.jsx'
import { NICHE_PAGES } from './presentation/pages/nichePages.js'

// Composição: liga a infraestrutura aos casos de uso. Fora do componente para ser estável.
// Catálogo, cupons, pedidos, avaliações, newsletter e contas: com VITE_API_URL (ex.: no .env.local) usam a API
// em server/; sem ela, dados de exemplo — e as contas ficam desligadas (não há onde guardá-las).
const sessionStore = new LocalStorageSessionStore()
const api = import.meta.env.VITE_API_URL
  ? createApiClient(import.meta.env.VITE_API_URL, { getToken: () => sessionStore.get() })
  : null
const productRepository = api ? new HttpProductRepository(api) : new MockProductRepository()
const getBanners = makeGetBanners(api ? new HttpBannerRepository(api) : new MockBannerRepository())
const getFeaturedProducts = makeGetFeaturedProducts(productRepository)
const getProducts = makeGetProducts(productRepository)
const getProductsByNiche = makeGetProductsByNiche(productRepository)
const getOnSaleProducts = makeGetOnSaleProducts(productRepository)
// Sacola guardada no navegador
const cartRepository = new LocalStorageCartRepository()
const getCart = makeGetCart({ cartRepository, productRepository })
const saveCart = makeSaveCart(cartRepository)
const applyCoupon = makeApplyCoupon(api ? new HttpCouponRepository(api) : new MockCouponRepository())
const subscribeToNewsletter = makeSubscribeToNewsletter(
  api ? new HttpNewsletterRepository(api) : new MockNewsletterRepository(),
)
// Página do produto
const reviewRepository = api ? new HttpReviewRepository(api) : new MockReviewRepository()
const getProductById = makeGetProductById(productRepository)
const getRelatedProducts = makeGetRelatedProducts(productRepository)
const getProductReviews = makeGetProductReviews(reviewRepository)
const submitReview = makeSubmitReview(reviewRepository)
const estimateShipping = makeEstimateShipping()
// Checkout
const placeOrder = makePlaceOrder(api ? new HttpOrderRepository(api) : new MockOrderRepository())
const findAddressByCep = makeFindAddressByCep(new ViaCepAddressLookup())
// Contas de cliente (só com a API)
const accountRepository = api ? new HttpAccountRepository(api) : null
const account = accountRepository && {
  getCurrentCustomer: makeGetCurrentCustomer({ accountRepository, sessionStore }),
  loginCustomer: makeLoginCustomer({ accountRepository, sessionStore }),
  registerCustomer: makeRegisterCustomer({ accountRepository, sessionStore }),
  logoutCustomer: makeLogoutCustomer({ accountRepository, sessionStore }),
  updateProfile: makeUpdateProfile(accountRepository),
  getMyOrders: makeGetMyOrders(accountRepository),
  getSavedAddress: makeGetSavedAddress(accountRepository),
}
// Painel da loja (só com a API; ela confere em cada chamada se a conta é da equipe)
const adminRepository = api ? new HttpAdminRepository(api) : null
const admin = adminRepository && {
  getAdminOrders: makeGetAdminOrders(adminRepository),
  changeOrderStatus: makeChangeOrderStatus(adminRepository),
  setTrackingCode: makeSetTrackingCode(adminRepository),
  getInventory: makeGetInventory(adminRepository),
  updateProduct: makeUpdateProduct(adminRepository),
  getCoupons: makeGetCoupons(adminRepository),
  createCoupon: makeCreateCoupon(adminRepository),
  setCouponActive: makeSetCouponActive(adminRepository),
  getAdminReviews: makeGetAdminReviews(adminRepository),
  setReviewHidden: makeSetReviewHidden(adminRepository),
  getSubscribers: makeGetSubscribers(adminRepository),
  removeSubscriber: makeRemoveSubscriber(adminRepository),
}

function App() {
  useScrollOnNavigate()

  // A sacola fica fora das rotas: o mesmo carrinho acompanha o usuário em todas as páginas
  const cart = useCart(getCart, saveCart, applyCoupon)
  const [isCartOpen, setCartOpen] = useState(false)
  // Estável para não reexecutar o efeito do Cart a cada render
  const closeCart = useCallback(() => setCartOpen(false), [])
  // A sacola + como abrir a gaveta (a página do produto abre a sacola depois de adicionar)
  const cartWithDrawer = { ...cart, openCart: () => setCartOpen(true) }
  // Conta do cliente (null quando as contas estão desligadas)
  const auth = useAuth(account)

  return (
    // Todos os componentes dentro daqui podem usar a sacola (ex.: o botão do ProductCard) e a conta
    <AuthContext value={auth}>
      <CartContext value={cartWithDrawer}>
        {/* Faixa de urgência (Black Friday) acima da NavBar; rola junto com a página, a NavBar continua fixa */}
        <AnnouncementBar />
        <NavBar
          cartCount={cart.count}
          onCartClick={() => setCartOpen(true)}
          account={auth && { name: auth.customer?.name ?? null }}
        />

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                getBanners={getBanners}
                getFeaturedProducts={getFeaturedProducts}
                getProducts={getProducts}
              />
            }
          />
          {/* Moda, Casa, Tecnologia, Saúde: mesma página, configurada em nichePages.js.
              A `key` faz cada nicho começar com os próprios filtros, sem herdar os da página anterior. */}
          {NICHE_PAGES.map((page) => (
            <Route
              key={page.slug}
              path={`/${page.slug}`}
              element={
                <NichePage key={page.slug} page={page} getBanners={getBanners} getProductsByNiche={getProductsByNiche} />
              }
            />
          ))}
          <Route path="/outlet" element={<OutletPage getBanners={getBanners} getOnSaleProducts={getOnSaleProducts} />} />
          <Route
            path="/produto/:productId"
            element={
              <ProductPage
                getProductById={getProductById}
                getRelatedProducts={getRelatedProducts}
                getProductReviews={getProductReviews}
                submitReview={submitReview}
                estimateShipping={estimateShipping}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage placeOrder={placeOrder} findAddressByCep={findAddressByCep} estimateShipping={estimateShipping} />
            }
          />
          <Route path="/pedido-confirmado" element={<OrderConfirmationPage />} />
          {/* Conta: só existem com a API (sem ela, caem no "*" e voltam para a Home) */}
          {auth && (
            <>
              <Route path="/entrar" element={<LoginPage />} />
              <Route path="/cadastro" element={<RegisterPage />} />
              <Route path="/minha-conta" element={<AccountPage />} />
              <Route path="/admin/*" element={<AdminPage admin={admin} />} />
            </>
          )}
          {/* Páginas do rodapé (Sobre nós, Trocas e devoluções...), conteúdo em content/infoPages.js */}
          {INFO_PAGES.map((page) => (
            <Route key={page.slug} path={`/${page.slug}`} element={<InfoPage page={page} />} />
          ))}
          {/* Endereço desconhecido volta para a Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Rodapé fora das rotas: aparece em todas as páginas, como a NavBar */}
        <Footer onSubscribe={subscribeToNewsletter} />

        <Cart isOpen={isCartOpen} onClose={closeCart} cart={cart} />
      </CartContext>
    </AuthContext>
  )
}

export default App
