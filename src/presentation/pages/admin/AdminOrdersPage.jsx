import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ORDER_STATUSES } from '../../../domain/entities/Order.js'
import AdminLoadError from '../../components/admin/AdminLoadError.jsx'
import AdminOrderCard from '../../components/admin/AdminOrderCard.jsx'
import FilterChips from '../../components/admin/FilterChips.jsx'
import ListSkeleton from '../../components/admin/ListSkeleton.jsx'
import Pagination from '../../components/admin/Pagination.jsx'
import { formatOrderStatus } from '../../formatters/order.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useRemoteData } from '../../hooks/useRemoteData.js'

const sum = (counts) => Object.values(counts).reduce((total, count) => total + count, 0)

/**
 * Painel → Pedidos (/admin). Filtro por situação e página ficam no endereço (?situacao=paid&pagina=2):
 * o botão voltar e o link compartilhado mostram a mesma lista.
 */
function AdminOrdersPage({ getAdminOrders, changeOrderStatus }) {
  usePageTitle('Painel: pedidos')
  const [params, setParams] = useSearchParams()
  const status = ORDER_STATUSES.includes(params.get('situacao')) ? params.get('situacao') : null
  const page = Math.max(1, Number.parseInt(params.get('pagina') ?? '1', 10) || 1)

  const load = useCallback(() => getAdminOrders({ status, page }), [getAdminOrders, status, page])
  const orders = useRemoteData(load)
  const [notice, setNotice] = useState('')

  const goTo = ({ status: nextStatus = status, page: nextPage = 1 }) => {
    setNotice('')
    setParams({ ...(nextStatus && { situacao: nextStatus }), ...(nextPage > 1 && { pagina: String(nextPage) }) })
  }

  const handleChangeStatus = async (order, nextStatus) => {
    const result = await changeOrderStatus(order, nextStatus)
    if (result.order) {
      setNotice(`Pedido nº ${order.number}: ${formatOrderStatus(nextStatus).toLowerCase()}.`)
      // Mostra a nova situação na hora e recarrega para atualizar os números dos filtros
      orders.update((data) => ({ ...data, orders: data.orders.map((item) => (item.id === order.id ? result.order : item)) }))
      orders.reload()
    }
    return result
  }

  const counts = orders.data?.counts
  const filterOptions = [
    { value: null, label: 'Todos', count: counts && sum(counts) },
    ...ORDER_STATUSES.map((item) => ({ value: item, label: formatOrderStatus(item), count: counts?.[item] })),
  ]

  return (
    <div className="space-y-5">
      <FilterChips label="Filtrar pedidos por situação" options={filterOptions} value={status} onChange={(value) => goTo({ status: value })} />

      <div aria-live="polite">
        {notice && <p className="rounded-sm border border-border bg-muted px-4 py-3 text-sm font-medium">{notice}</p>}
      </div>

      {orders.status === 'failed' ? (
        <AdminLoadError error={orders.error} onRetry={orders.reload} />
      ) : !orders.data ? (
        <ListSkeleton />
      ) : orders.data.orders.length === 0 ? (
        <p className="rounded-sm border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {status ? `Nenhum pedido em "${formatOrderStatus(status)}".` : 'Nenhum pedido ainda.'}
        </p>
      ) : (
        <ul
          aria-busy={orders.status === 'loading'}
          className={`space-y-3 transition-opacity duration-200 ${orders.status === 'loading' ? 'opacity-60' : ''}`}
        >
          {orders.data.orders.map((order) => (
            <AdminOrderCard key={order.id} order={order} onChangeStatus={handleChangeStatus} />
          ))}
        </ul>
      )}

      {orders.data && (
        <Pagination
          page={page}
          pageSize={orders.data.pageSize}
          total={orders.data.total}
          onChange={(nextPage) => {
            goTo({ page: nextPage })
            window.scrollTo({ top: 0 })
          }}
        />
      )}
    </div>
  )
}

export default AdminOrdersPage
