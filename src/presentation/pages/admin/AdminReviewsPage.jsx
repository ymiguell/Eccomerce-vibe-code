import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import AdminLoadError from '../../components/admin/AdminLoadError.jsx'
import AdminReviewCard from '../../components/admin/AdminReviewCard.jsx'
import FilterChips from '../../components/admin/FilterChips.jsx'
import ListSkeleton from '../../components/admin/ListSkeleton.jsx'
import Pagination from '../../components/admin/Pagination.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useRemoteData } from '../../hooks/useRemoteData.js'

// Filtro no endereço (?mostrar=ocultas) → valor da API
const VISIBILITY_BY_PARAM = { visiveis: 'visible', ocultas: 'hidden' }
const PARAM_BY_VISIBILITY = { visible: 'visiveis', hidden: 'ocultas' }

/** Painel → Avaliações (/admin/avaliacoes): todas as avaliações da loja, para ocultar as impróprias. */
function AdminReviewsPage({ getAdminReviews, setReviewHidden }) {
  usePageTitle('Painel: avaliações')
  const [params, setParams] = useSearchParams()
  const visibility = VISIBILITY_BY_PARAM[params.get('mostrar')] ?? null
  const page = Math.max(1, Number.parseInt(params.get('pagina') ?? '1', 10) || 1)

  const load = useCallback(() => getAdminReviews({ visibility, page }), [getAdminReviews, visibility, page])
  const reviews = useRemoteData(load)
  const [notice, setNotice] = useState('')

  const goTo = ({ visibility: nextVisibility = visibility, page: nextPage = 1 }) => {
    setNotice('')
    setParams({
      ...(nextVisibility && { mostrar: PARAM_BY_VISIBILITY[nextVisibility] }),
      ...(nextPage > 1 && { pagina: String(nextPage) }),
    })
  }

  const handleToggle = async (review, hidden) => {
    const result = await setReviewHidden(review.id, hidden)
    if (result.review) {
      setNotice(hidden ? `Avaliação de ${review.author} ocultada da loja.` : `Avaliação de ${review.author} visível de novo.`)
      reviews.update((data) => ({
        ...data,
        reviews: data.reviews.map((item) => (item.id === review.id ? result.review : item)),
      }))
      reviews.reload()
    }
    return result
  }

  const counts = reviews.data?.counts
  const options = [
    { value: null, label: 'Todas', count: counts && counts.visible + counts.hidden },
    { value: 'visible', label: 'Visíveis', count: counts?.visible },
    { value: 'hidden', label: 'Ocultas', count: counts?.hidden },
  ]

  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Avaliações publicadas pelos clientes. Oculte as que tiverem ofensas, propaganda ou dados pessoais: elas somem da
        loja e deixam de contar na nota, mas dá para mostrar de novo.
      </p>

      <FilterChips label="Filtrar avaliações" options={options} value={visibility} onChange={(value) => goTo({ visibility: value })} />

      <div aria-live="polite">
        {notice && <p className="rounded-sm border border-border bg-muted px-4 py-3 text-sm font-medium">{notice}</p>}
      </div>

      {reviews.status === 'failed' ? (
        <AdminLoadError error={reviews.error} onRetry={reviews.reload} />
      ) : !reviews.data ? (
        <ListSkeleton />
      ) : reviews.data.reviews.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {visibility === 'hidden' ? 'Nenhuma avaliação oculta.' : 'Nenhuma avaliação ainda.'}
        </p>
      ) : (
        <ul
          aria-busy={reviews.status === 'loading'}
          className={`space-y-3 transition-opacity duration-200 ${reviews.status === 'loading' ? 'opacity-60' : ''}`}
        >
          {reviews.data.reviews.map((review) => (
            <AdminReviewCard key={review.id} review={review} onToggle={handleToggle} />
          ))}
        </ul>
      )}

      {reviews.data && (
        <Pagination
          page={page}
          pageSize={reviews.data.pageSize}
          total={reviews.data.total}
          onChange={(nextPage) => {
            goTo({ page: nextPage })
            window.scrollTo({ top: 0 })
          }}
        />
      )}
    </div>
  )
}

export default AdminReviewsPage
