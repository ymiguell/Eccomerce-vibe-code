import BannerCarousel from '../components/BannerCarousel.jsx'
import FeaturedProducts from '../components/FeaturedProducts.jsx'
import ProductCarousel from '../components/ProductCarousel.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import { useAsyncData } from '../hooks/useAsyncData.js'
import { useBanners } from '../hooks/useBanners.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

// Cada item vira: frase de efeito + carrossel da categoria. Para adicionar/trocar, basta editar aqui.
const categorySections = [
  {
    category: 'Camisetas',
    title: 'Estilo que começa no básico',
    description: 'Peças versáteis para montar looks do jeito que você é.',
  },
  {
    category: 'Calçados',
    title: 'Cada passo conta',
    description: 'Do casual ao esportivo, conforto e estilo em todo caminho.',
  },
]

function HomePage({ getBanners, getFeaturedProducts, getProducts }) {
  usePageTitle('Moda e estilo')

  const banners = useBanners(getBanners, 'home')
  const featuredProducts = useAsyncData(getFeaturedProducts)
  const products = useAsyncData(getProducts)

  return (
    <main id="home">
      <BannerCarousel banners={banners} />
      <FeaturedProducts products={featuredProducts} />

      {categorySections.map((section) => (
        <div key={section.category}>
          <SectionHeading title={section.title} description={section.description} />
          <ProductCarousel
            title={section.category}
            products={products.filter((product) => product.category === section.category)}
          />
        </div>
      ))}
    </main>
  )
}

export default HomePage
