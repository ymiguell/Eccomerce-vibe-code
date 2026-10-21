import { useState } from 'react'
import BannerCarousel from '../components/BannerCarousel.jsx'
import NoResults from '../components/NoResults.jsx'
import ProductFilterBar from '../components/ProductFilterBar.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import { useAsyncData } from '../hooks/useAsyncData.js'
import { useBanners } from '../hooks/useBanners.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useProductFilters } from '../hooks/useProductFilters.js'
import { NICHE_PAGES } from './nichePages.js'

const OUTLET_FILTER_LABELS = { category: 'Tipo de produto', size: 'Tamanho', fabric: 'Material' }

/**
 * Outlet: só produtos com desconto, de todos os nichos, separados por título (Moda, Casa...).
 * Os filtros valem para a página inteira; cada nicho tem a própria grade com "Carregar mais".
 */
function OutletPage({ getBanners, getOnSaleProducts }) {
  usePageTitle('Outlet')

  const banners = useBanners(getBanners, 'outlet')
  const products = useAsyncData(getOnSaleProducts)
  // Começa pelos maiores descontos, que é o que se procura num outlet
  const catalog = useProductFilters(products, 'discount')
  const [density, setDensity] = useState('compact')

  const { visibleProducts } = catalog
  const isLoaded = products.length > 0

  // Uma seção por nicho, na mesma ordem do menu; nichos sem produto (após os filtros) não aparecem
  const sections = NICHE_PAGES.map((page) => ({
    ...page,
    products: visibleProducts.filter((product) => product.niche === page.slug),
  })).filter((section) => section.products.length > 0)

  return (
    <main id="outlet" className="pb-16">
      <h1 className="sr-only">Outlet</h1>
      <BannerCarousel banners={banners} />

      <ProductFilterBar
        catalog={catalog}
        total={visibleProducts.length}
        density={density}
        onDensityChange={setDensity}
        labels={OUTLET_FILTER_LABELS}
      />

      {isLoaded && visibleProducts.length === 0 ? (
        <NoResults onClearFilters={catalog.clearFilters} />
      ) : (
        sections.map((section) => (
          <ProductGrid key={section.slug} title={section.title} products={section.products} density={density} />
        ))
      )}
    </main>
  )
}

export default OutletPage
