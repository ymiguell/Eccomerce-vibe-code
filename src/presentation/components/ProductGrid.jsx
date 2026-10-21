import { useEffect, useId, useRef } from 'react'
import { useLoadMore } from '../hooks/useLoadMore.js'
import ProductCard from './ProductCard.jsx'

// 12 divide igualmente 2, 3 e 4 colunas: a última linha de cada leva fica sempre completa
const PAGE_SIZE = 12

const densityColumns = {
  comfortable: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  compact: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
}

/**
 * Grade de produtos com rolagem para baixo e botão "Carregar mais".
 * Só desenha os cards já pedidos, o que mantém a página leve mesmo com catálogos grandes.
 */
function ProductGrid({ title, products, density = 'compact' }) {
  const titleId = useId()
  const listRef = useRef(null)
  const focusIndexRef = useRef(null)
  const { visibleItems, shownCount, total, hasMore, loadMore } = useLoadMore(products, PAGE_SIZE)

  // Para quem navega pelo teclado: depois de carregar, o foco vai para o primeiro card novo
  useEffect(() => {
    if (focusIndexRef.current === null) return
    listRef.current?.children[focusIndexRef.current]?.querySelector('a')?.focus({ preventScroll: true })
    focusIndexRef.current = null
  }, [shownCount])

  const handleLoadMore = () => {
    focusIndexRef.current = shownCount
    loadMore()
  }

  if (total === 0) return null

  return (
    <section aria-labelledby={titleId} className="mx-auto mt-8 max-w-7xl px-4 sm:mt-10 sm:px-6 lg:px-8">
      <h2 id={titleId} className="text-2xl font-semibold sm:text-3xl">
        {title}
      </h2>

      <ul ref={listRef} className={`mt-4 grid gap-x-4 gap-y-8 sm:mt-6 sm:gap-6 lg:gap-8 ${densityColumns[density]}`}>
        {visibleItems.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      {/* Progresso + botão: o usuário sempre sabe quanto falta. Só aparece se a lista não couber numa leva. */}
      {total > PAGE_SIZE && (
        <div className="mx-auto mt-10 flex max-w-xs flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Mostrando {shownCount} de {total} {total === 1 ? 'produto' : 'produtos'}
          </p>
          <div
            role="progressbar"
            aria-label="Produtos exibidos"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={shownCount}
            className="h-1 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${(shownCount / total) * 100}%` }}
            />
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              className="mt-2 w-full rounded-sm border-2 border-primary px-6 py-3 text-sm font-semibold tracking-wide text-primary uppercase transition-colors duration-200 hover:bg-primary hover:text-on-primary"
            >
              Carregar mais
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export default ProductGrid
