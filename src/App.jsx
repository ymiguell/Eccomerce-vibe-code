import { useCallback, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { makeApplyCoupon } from './application/useCases/applyCoupon.js'
import { makeGetBanners } from './application/useCases/getBanners.js'
import { makeEstimateShipping } from './application/useCases/estimateShipping.js'
import { makeGetCart } from './application/useCases/getCart.js'
import { makeGetFeaturedProducts } from './application/useCases/getFeaturedProducts.js'
import { makeGetProducts } from './application/useCases/getProducts.js'
import { makeGetOnSaleProducts } from './application/useCases/getOnSaleProducts.js'
import { makeGetProductById } from './application/useCases/getProductById.js'
import { makeGetProductReviews } from './application/useCases/getProductReviews.js'
import { makeGetProductsByNiche } from './application/useCases/getProductsByNiche.js'
import { makeGetRelatedProducts } from './application/useCases/getRelatedProducts.js'
import { makeSubmitReview } from './application/useCases/submitReview.js'
import { makeSubscribeToNewsletter } from './application/useCases/subscribeToNewsletter.js'
import { MockBannerRepository } from './infrastructure/repositories/MockBannerRepository.js'
import { MockCartRepository } from './infrastructure/repositories/MockCartRepository.js'
import { MockCouponRepository } from './infrastructure/repositories/MockCouponRepository.js'
import { MockNewsletterRepository } from './infrastructure/repositories/MockNewsletterRepository.js'
import { MockProductRepository } from './infrastructure/repositories/MockProductRepository.js'
import { MockReviewRepository } from './infrastructure/repositories/MockReviewRepository.js'
import AnnouncementBar from './presentation/components/AnnouncementBar.jsx'
import Cart from './presentation/components/Cart.jsx'
import Footer from './presentation/components/Footer.jsx'
import NavBar from './presentation/components/NavBar.jsx'
import { CartContext } from './presentation/context/cartContext.js'
import { useCart } from './presentation/hooks/useCart.js'
import { useScrollOnNavigate } from './presentation/hooks/useScrollOnNavigate.js'
import HomePage from './presentation/pages/HomePage.jsx'
import NichePage from './presentation/pages/NichePage.jsx'
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
const getCart = makeGetCart({ cartRepository: new MockCartRepository(), productRepository })
const applyCoupon = makeApplyCoupon(new MockCouponRepository())
const subscribeToNewsletter = makeSubscribeToNewsletter(new MockNewsletterRepository())
// Página do produto
const reviewRepository = new MockReviewRepository()
const getProductById = makeGetProductById(productRepository)
const getRelatedProducts = makeGetRelatedProducts(productRepository)
const getProductReviews = makeGetProductReviews(reviewRepository)
const submitReview = makeSubmitReview(reviewRepository)
const estimateShipping = makeEstimateShipping()

function App() {
  useScrollOnNavigate()

  // A sacola fica fora das rotas: o mesmo carrinho acompanha o usuário em todas as páginas
  const cart = useCart(getCart, applyCoupon)
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
