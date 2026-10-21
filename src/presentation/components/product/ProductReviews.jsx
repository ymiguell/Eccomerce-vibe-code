import { useState } from 'react'
import { useLoadMore } from '../../hooks/useLoadMore.js'
import { formatRating, formatReviewDate } from '../../formatters/rating.js'
import ReviewForm from './ReviewForm.jsx'
import StarRating from './StarRating.jsx'

const PAGE_SIZE = 3

/** Seção de avaliações: resumo das notas, lista com "Carregar mais" e formulário para avaliar. */
function ProductReviews({ reviews, summary, onSubmitReview }) {
  const [writing, setWriting] = useState(false)
  const [published, setPublished] = useState(false)
  const { visibleItems, hasMore, loadMore } = useLoadMore(reviews, PAGE_SIZE)

  const handleSubmit = async (values) => {
    const result = await onSubmitReview(values)
    if (result.review) {
      setWriting(false)
      setPublished(true)
    }
    return result
  }

  return (
    <section id="avaliacoes" aria-labelledby="reviews-title" className="mt-20 scroll-mt-24">
      <h2 id="reviews-title" className="text-3xl font-semibold sm:text-4xl">
        Avaliações dos clientes
      </h2>

      <div className="mt-8 grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
        {/* Resumo */}
        <div>
          {summary.count > 0 ? (
            <>
              <div className="flex items-center gap-4">
                <p className="text-5xl font-bold">{formatRating(summary.average)}</p>
                <div>
                  <StarRating value={summary.average} size="size-5" />
                  <p className="mt-1 text-sm text-muted-foreground">
                    {summary.count} {summary.count === 1 ? 'avaliação' : 'avaliações'}
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-2" aria-label="Distribuição das notas">
                {summary.distribution.map(({ stars, count }) => (
                  <li key={stars} className="flex items-center gap-3 text-sm">
                    <span className="w-[4.5rem] shrink-0 whitespace-nowrap">
                      {stars} {stars === 1 ? 'estrela' : 'estrelas'}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                      <span className="block h-full rounded-full bg-amber-400" style={{ width: `${(count / summary.count) * 100}%` }} />
                    </span>
                    <span className="w-6 shrink-0 text-right text-muted-foreground">{count}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-muted-foreground">Este produto ainda não tem avaliações. Seja o primeiro a avaliar!</p>
          )}
        </div>

        {/* Lista + ações */}
        <div>
          <p aria-live="polite">
            {published && (
              <span className="mb-6 block rounded-sm border border-primary/25 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
                Obrigado! Sua avaliação foi publicada.
              </span>
            )}
          </p>

          {writing && (
            <div className="mb-8">
              <ReviewForm onSubmit={handleSubmit} onCancel={() => setWriting(false)} />
            </div>
          )}

          {reviews.length > 0 && (
            <ul className="divide-y divide-border border-y border-border">
              {visibleItems.map((review) => (
                <li key={review.id} className="py-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StarRating value={review.rating} />
                    <span className="text-xs text-muted-foreground">{formatReviewDate(review.date)}</span>
                  </div>
                  <p className="mt-3 leading-relaxed">{review.comment}</p>
                  <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold">{review.author}</span>
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <svg className="size-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                        Compra verificada
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {hasMore && (
              <button
                type="button"
                onClick={loadMore}
                className="min-h-11 rounded-sm border border-border px-6 text-sm font-semibold tracking-wide uppercase transition-colors duration-200 hover:border-foreground"
              >
                Carregar mais
              </button>
            )}
            {!writing && (
              <button
                type="button"
                onClick={() => {
                  setWriting(true)
                  setPublished(false)
                }}
                className="min-h-11 rounded-sm bg-primary px-6 text-sm font-semibold tracking-wide text-on-primary uppercase transition-colors duration-200 hover:bg-primary-hover"
              >
                Escrever avaliação
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductReviews
