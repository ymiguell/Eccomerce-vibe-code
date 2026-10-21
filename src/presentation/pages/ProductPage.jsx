import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import ProductGrid from '../components/ProductGrid.jsx'
import Breadcrumb from '../components/product/Breadcrumb.jsx'
import ProductBuyBox from '../components/product/ProductBuyBox.jsx'
import ProductDetails from '../components/product/ProductDetails.jsx'
import ProductFaq from '../components/product/ProductFaq.jsx'
import ProductGallery from '../components/product/ProductGallery.jsx'
import ProductReviews from '../components/product/ProductReviews.jsx'
import StarRating from '../components/product/StarRating.jsx'
import { formatRating } from '../formatters/rating.js'
import { useAsyncData } from '../hooks/useAsyncData.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useProduct } from '../hooks/useProduct.js'
import { useProductReviews } from '../hooks/useProductReviews.js'
import { NICHE_PAGES } from './nichePages.js'

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'

function ProductPageSkeleton() {
  return (
    <div className={`${container} mt-6 grid animate-pulse gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-12`} aria-hidden="true">
      <div className="aspect-square rounded-sm bg-muted" />
      <div className="space-y-4">
        <div className="h-8 w-3/4 rounded-sm bg-muted" />
        <div className="h-10 w-1/2 rounded-sm bg-muted" />
        <div className="h-32 rounded-sm bg-muted" />
      </div>
    </div>
  )
}

function ProductNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Produto não encontrado</h1>
      <p className="mt-3 text-muted-foreground">Ele pode ter saído do catálogo ou o endereço está incorreto.</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-sm bg-primary px-6 py-3 text-sm font-semibold tracking-wide text-on-primary uppercase transition-colors duration-200 hover:bg-primary-hover"
      >
        Voltar para a loja
      </Link>
    </div>
  )
}

/**
 * Página do produto (/produto/:productId):
 * trilha de navegação, galeria, compra, descrição, relacionados, avaliações e dúvidas frequentes.
 */
function ProductPage({ getProductById, getRelatedProducts, getProductReviews, submitReview, estimateShipping }) {
  const { productId } = useParams()
  const { loading, product } = useProduct(getProductById, productId)
  const { reviews, summary, submit } = useProductReviews(getProductReviews, submitReview, productId)

  const loadRelated = useCallback(
    () => (product ? getRelatedProducts(product) : Promise.resolve([])),
    [getRelatedProducts, product],
  )
  const related = useAsyncData(loadRelated)

  usePageTitle(product?.name ?? 'Produto')

  if (loading) return <ProductPageSkeleton />
  if (!product) return <ProductNotFound />

  const niche = NICHE_PAGES.find((page) => page.slug === product.niche)
  const images = product.imageUrl ? [product.imageUrl] : []

  return (
    <main className="pb-16">
      <div className={`${container} mt-6`}>
        <Breadcrumb
          items={[
            { label: 'Home', to: '/' },
            ...(niche ? [{ label: niche.title, to: `/${niche.slug}` }] : []),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_28rem]">
          <div>
            <header className="mb-5">
              <p className="text-xs font-semibold tracking-widest text-accent uppercase">{product.category}</p>
              <h1 className="mt-1 text-3xl leading-tight font-semibold sm:text-4xl">{product.name}</h1>
              <a href="#avaliacoes" className="mt-2 inline-flex min-h-8 items-center gap-2 text-sm hover:text-primary">
                {summary.count > 0 ? (
                  <>
                    <StarRating value={summary.average} />
                    <span className="font-semibold">{formatRating(summary.average)}</span>
                    <span className="text-muted-foreground underline underline-offset-2">
                      {summary.count} {summary.count === 1 ? 'avaliação' : 'avaliações'}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground underline underline-offset-2">Seja o primeiro a avaliar</span>
                )}
              </a>
            </header>
            {/* `key`: ao ir para outro produto, a galeria e a compra começam do zero */}
            <ProductGallery key={product.id} images={images} name={product.name} />
          </div>

          {/* No desktop, a coluna de compra acompanha a rolagem enquanto a galeria passa */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductBuyBox key={product.id} product={product} estimateShipping={estimateShipping} />
          </div>
        </div>

        <div className="mt-12">
          <ProductDetails product={product} />
        </div>
      </div>

      <ProductGrid title="Você também pode gostar" products={related} />

      <div className={container}>
        <ProductReviews key={product.id} reviews={reviews} summary={summary} onSubmitReview={submit} />
        <ProductFaq />
      </div>
    </main>
  )
}

export default ProductPage
