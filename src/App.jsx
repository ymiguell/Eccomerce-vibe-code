import { useCallback, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { makeApplyCoupon } from './application/useCases/applyCoupon.js'
import { makeGetBanners } from './application/useCases/getBanners.js'
import { makeEstimateShipping } from './application/useCases/estimateShipping.js'
import { makeFindAddressByCep } from './application/useCases/findAddressByCep.js'
import { makeGetCart } from './application/useCases/getCart.js'
import { makeGetFeaturedProducts } from './application/useCases/getFeaturedProducts.js'
import { makeGetProducts } from './application/useCases/getProducts.js'
import { makeGetOnSaleProducts } from './application/useCases/getOnSaleProducts.js'
import { makeGetProductById } from './application/useCases/getProductById.js'
import { makeGetProductReviews } from './application/useCases/getProductReviews.js'
import { makeGetProductsByNiche } from './application/useCases/getProductsByNiche.js'
import { makeGetRelatedProducts } from './application/useCases/getRelatedProducts.js'
import { makePlaceOrder } from './application/useCases/placeOrder.js'
import { makeSaveCart } from './application/useCases/saveCart.js'
import { makeSubmitReview } from './application/useCases/submitReview.js'
import { makeSubscribeToNewsletter } from './application/useCases/subscribeToNewsletter.js'
import { LocalStorageCartRepository } from './infrastructure/repositories/LocalStorageCartRepository.js'
import { MockBannerRepository } from './infrastructure/repositories/MockBannerRepository.js'
import { MockCouponRepository } from './infrastructure/repositories/MockCouponRepository.js'
import { MockNewsletterRepository } from './infrastructure/repositories/MockNewsletterRepository.js'
import { MockOrderRepository } from './infrastructure/repositories/MockOrderRepository.js'
import { MockProductRepository } from './infrastructure/repositories/MockProductRepository.js'
import { MockReviewRepository } from './infrastructure/repositories/MockReviewRepository.js'
import { ViaCepAddressLookup } from './infrastructure/services/ViaCepAddressLookup.js'
import AnnouncementBar from './presentation/components/AnnouncementBar.jsx'
import Cart from './presentation/components/Cart.jsx'
import Footer from './presentation/components/Footer.jsx'
import NavBar from './presentation/components/NavBar.jsx'
import { CartContext } from './presentation/context/cartContext.js'
import { useCart } from './presentation/hooks/useCart.js'
import { useScrollOnNavigate } from './presentation/hooks/useScrollOnNavigate.js'
import CheckoutPage from './presentation/pages/CheckoutPage.jsx'
import HomePage from './presentation/pages/HomePage.jsx'
import NichePage from './presentation/pages/NichePage.jsx'
import OrderConfirmationPage from './presentation/pages/OrderConfirmationPage.jsx'
import OutletPage from './presentation/pages/OutletPage.jsx'
import ProductPage from './presentation/pages/ProductPage.jsx'
import { NICHE_PAGES } from './presentation/pages/nichePages.js'

// Composição: liga a infraestrutura (mock) aos casos de uso. Fora do componente para ser estável.
const productRepository = new MockProductRepository()
const getBanners = makeGetBanners(new MockBannerRepository())
const getFeaturedProducts = makeGetFeaturedProducts(productRepository)
const getProducts = makeGetProducts(productRepository)
const getProductsByNiche = makeGetProductsByNiche(productRepository)
const getOnSaleProducts = makeGetOnSaleProducts(productRepository)
// Sacola guardada no navegador
const cartRepository = new LocalStorageCartRepository()
const getCart = makeGetCart({ cartRepository, productRepository })
const saveCart = makeSaveCart(cartRepository)
const applyCoupon = makeApplyCoupon(new MockCouponRepository())
const subscribeToNewsletter = makeSubscribeToNewsletter(new MockNewsletterRepository())
// Página do produto
const reviewRepository = new MockReviewRepository()
const getProductById = makeGetProductById(productRepository)
const getRelatedProducts = makeGetRelatedProducts(productRepository)
const getProductReviews = makeGetProductReviews(reviewRepository)
const submitReview = makeSubmitReview(reviewRepository)
const estimateShipping = makeEstimateShipping()
// Checkout
const placeOrder = makePlaceOrder(new MockOrderRepository())
const findAddressByCep = makeFindAddressByCep(new ViaCepAddressLookup())

function App() {
  useScrollOnNavigate()

  // A sacola fica fora das rotas: o mesmo carrinho acompanha o usuário em todas as páginas
  const cart = useCart(getCart, saveCart, applyCoupon)
  const [isCartOpen, setCartOpen] = useState(false)
  // Estável para não reexecutar o efeito do Cart a cada render
  const closeCart = useCallback(() => setCartOpen(false), [])
  // A sacola + como abrir a gaveta (a página do produto abre a sacola depois de adicionar)
  const cartWithDrawer = { ...cart, openCart: () => setCartOpen(true) }

  return (
    // Todos os componentes dentro daqui podem usar a sacola (ex.: o botão do ProductCard)
    <CartContext value={cartWithDrawer}>
      {/* Faixa de urgência (Black Friday) acima da NavBar; rola junto com a página, a NavBar continua fixa */}
      <AnnouncementBar />
      <NavBar cartCount={cart.count} onCartClick={() => setCartOpen(true)} />

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
        {/* Endereço desconhecido volta para a Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Rodapé fora das rotas: aparece em todas as páginas, como a NavBar */}
      <Footer onSubscribe={subscribeToNewsletter} />

      <Cart isOpen={isCartOpen} onClose={closeCart} cart={cart} />
    </CartContext>
  )
}

export default App
