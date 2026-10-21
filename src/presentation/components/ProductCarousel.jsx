import { useCallback, useEffect, useId, useRef, useState } from 'react'
import ProductCard from './ProductCard.jsx'

/**
 * Linha de produtos com rolagem horizontal.
 * Celular: arrasta com o dedo (scroll-snap nativo). Tablet/desktop: setas.
 */
function ProductCarousel({ title, products }) {
  const titleId = useId()
  const trackRef = useRef(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  // Habilita/desabilita as setas conforme a posição da rolagem
  const updateArrows = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    setCanScrollPrev(track.scrollLeft > 0)
    // -1 compensa arredondamentos de subpixel
    setCanScrollNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 1)
  }, [])

  useEffect(() => {
    updateArrows()
    window.addEventListener('resize', updateArrows)
    return () => window.removeEventListener('resize', updateArrows)
  }, [updateArrows, products])

  // Quando a lista muda (ex.: filtro aplicado), volta para o primeiro card
  const productIds = products.map((product) => product.id).join(',')
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 })
  }, [productIds])

  // Avança uma "página" inteira de cards visíveis
  const scrollByPage = (direction) => {
    const track = trackRef.current
    track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section aria-labelledby={titleId} className="mx-auto mt-8 max-w-7xl px-4 sm:mt-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <h3 id={titleId} className="text-2xl font-semibold sm:text-3xl">
          {title}
        </h3>

        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={!canScrollPrev}
            aria-label={`Produtos anteriores de ${title}`}
            className="rounded-full border border-border p-3 text-foreground transition-colors duration-200 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={!canScrollNext}
            aria-label={`Próximos produtos de ${title}`}
            className="rounded-full border border-border p-3 text-foreground transition-colors duration-200 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cards visíveis: celular 1 + um pedaço do próximo · 640px 2 · 768px 3 · 1024px 4 */}
      <ul
        ref={trackRef}
        onScroll={updateArrows}
        className={`mt-4 grid snap-x snap-mandatory auto-cols-[80%] grid-flow-col gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] sm:mt-6 sm:auto-cols-[calc((100%-1.5rem)/2)] sm:gap-6 md:auto-cols-[calc((100%-3rem)/3)] lg:auto-cols-[calc((100%-4.5rem)/4)] [&::-webkit-scrollbar]:hidden`}
      >
        {products.map((product) => (
          <li key={product.id} className="snap-start">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ProductCarousel
