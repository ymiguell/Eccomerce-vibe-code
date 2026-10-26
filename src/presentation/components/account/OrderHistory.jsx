import { Link } from 'react-router'
import { formatPrice } from '../../formatters/currency.js'
import {
  formatAddressLines,
  formatDeliveryWindow,
  formatOrderDate,
  formatOrderStatus,
  formatPayment,
} from '../../formatters/order.js'
import OrderItemList from '../checkout/OrderItemList.jsx'
import OrderTotals from '../checkout/OrderTotals.jsx'

const countItems = (order) => order.items.reduce((sum, item) => sum + item.quantity, 0)

function OrderCard({ order }) {
  const itemCount = countItems(order)

  return (
    <li className="rounded-sm border border-border">
      {/* <details>: abre e fecha sem JavaScript e funciona no teclado */}
      <details className="group">
        <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
          <div>
            <p className="font-semibold">Pedido nº {order.number}</p>
            <p className="text-sm text-muted-foreground">
              {formatOrderDate(order.createdAt)} · {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {formatOrderStatus(order.status)}
            </span>
            <span className="font-semibold">{formatPrice(order.totals.total)}</span>
            <svg
              className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </summary>

        <div className="border-t border-border px-4 pb-5 sm:px-5">
          <OrderItemList items={order.items} />
          <div className="mt-2 grid gap-4 border-t border-border pt-4 text-sm sm:grid-cols-2">
            <div>
              <p className="font-semibold">Entrega</p>
              <p className="mt-1 text-muted-foreground">Prazo: {formatDeliveryWindow(order.delivery)}</p>
              {formatAddressLines(order.address).map((line) => (
                <p key={line} className="text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
            <div>
              <p className="font-semibold">Pagamento</p>
              <p className="mt-1 text-muted-foreground">{formatPayment(order.payment)}</p>
              <div className="mt-3">
                <OrderTotals totals={order.totals} coupon={order.coupon} payment={order.payment} />
              </div>
            </div>
          </div>
        </div>
      </details>
    </li>
  )
}

/** "Meus pedidos": lista com o resumo de cada pedido; clicando, abre itens, entrega e valores. */
function OrderHistory({ status, orders }) {
  if (status === 'loading') {
    return (
      <div className="space-y-3" aria-busy="true">
        {[1, 2].map((key) => (
          <div key={key} className="h-20 animate-pulse rounded-sm bg-muted" />
        ))}
      </div>
    )
  }

  if (status === 'failed') {
    return <p className="text-sm text-muted-foreground">Não conseguimos carregar seus pedidos agora. Tente de novo em instantes.</p>
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-border p-6 text-center">
        <p className="font-semibold">Você ainda não fez pedidos com esta conta</p>
        <p className="mt-1 text-sm text-muted-foreground">Os pedidos feitos com você logado aparecem aqui.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-4">
          Ir para a loja
        </Link>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </ul>
  )
}

export default OrderHistory
