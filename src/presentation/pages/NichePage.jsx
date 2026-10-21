import { useState } from 'react'
import BannerCarousel from '../components/BannerCarousel.jsx'
import NoResults from '../components/NoResults.jsx'
import ProductFilterBar from '../components/ProductFilterBar.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import { useBanners } from '../hooks/useBanners.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useProductFilters } from '../hooks/useProductFilters.js'
import { useProductsByNiche } from '../hooks/useProductsByNiche.js'

/**
 * Página de um nicho da loja (Moda, Casa, Tecnologia, Saúde...).
 * O conteúdo de cada uma vem da configuração em nichePages.js.
 */
function NichePage({ page, getBanners, getProductsByNiche }) {
  usePageTitle(page.title)

  // Banners com placement = slug e produtos com niche = slug (ver os repositórios em infrastructure/)
  const banners = useBanners(getBanners, page.slug)
  const products = useProductsByNiche(getProductsByNiche, page.slug)
  const catalog = useProductFilters(products)
  const [density, setDensity] = useState('compact')

  const { visibleProducts } = catalog
  const isLoaded = products.length > 0

  return (
    <main id={page.slug} className="pb-16">
      <h1 className="sr-only">{page.title}</h1>
      <BannerCarousel banners={banners} />

      <ProductFilterBar
        catalog={catalog}
        total={visibleProducts.length}
        density={density}
        onDensityChange={setDensity}
        labels={page.filterLabels}
      />

      {isLoaded && visibleProducts.length === 0 ? (
        <NoResults onClearFilters={catalog.clearFilters} />
      ) : (
        <ProductGrid title={page.productsTitle} products={visibleProducts} density={density} />
      )}
    </main>
  )
}

export default NichePage
