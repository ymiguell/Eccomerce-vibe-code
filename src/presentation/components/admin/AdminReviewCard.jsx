import { useState } from 'react'
import { Link } from 'react-router'
import { formatAdminError } from '../../formatters/adminErrors.js'
import { formatReviewDate } from '../../formatters/rating.js'
import StarRating from '../product/StarRating.jsx'

/**
 * Avaliação no painel: produto, nota, autor, data e comentário, com "Ocultar"/"Mostrar".
 * Ocultar não apaga (dá para mostrar de novo), por isso não pede confirmação.
 * `onToggle(review, hidden)` → { review } | { error }
 */
function AdminReviewCard({ review, onToggle }) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const toggle = async () => {
    setSending(true)
    setError('')
    const result = await onToggle(review, !review.hidden)
    setSending(false)
    if (!result.review) setError(formatAdminError(result.error))
  }

  return (
    <li className={`rounded-sm border border-border p-4 sm:p-5 ${review.hidden ? 'bg-muted/60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/produto/${review.productId}`}
            className="text-sm font-semibold underline-offset-4 hover:underline"
          >
            {review.productName}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <StarRating value={review.rating} />
            <span className="text-xs text-muted-foreground">
              {review.author} · {formatReviewDate(review.date)}
            </span>
            {review.verifiedPurchase && <span className="text-xs font-semibold">Compra verificada</span>}
            {review.hidden && (
              <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                Oculta
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={sending}
          className="min-h-11 shrink-0 rounded-sm border border-border px-4 text-sm font-semibold transition-colors duration-200 hover:border-foreground disabled:opacity-60"
        >
          {sending ? 'Salvando…' : review.hidden ? 'Mostrar' : 'Ocultar'}
        </button>
      </div>
      <p className={`mt-3 text-sm leading-relaxed break-words ${review.hidden ? 'text-muted-foreground' : ''}`}>{review.comment}</p>
      <div aria-live="polite">{error && <p className="mt-2 text-sm font-medium text-primary">{error}</p>}</div>
    </li>
  )
}

export default AdminReviewCard
