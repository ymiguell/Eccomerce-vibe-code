import { formatPrice } from '../../formatters/currency.js'
import { formatPhone } from '../../formatters/masks.js'
import { formatAddressLines, formatDeliveryWindow, formatOrderDate, formatPayment } from '../../formatters/order.js'
import OrderItemList from '../checkout/OrderItemList.jsx'
import OrderTotals from '../checkout/OrderTotals.jsx'
import OrderStatusBadge from '../order/OrderStatusBadge.jsx'
import OrderStatusActions from './OrderStatusActions.jsx'

/**
 * Pedido no painel: resumo (número, data, cliente, situação, total); clicando, abre itens, cliente,
 * entrega, pagamento e os botões do próximo passo.
 */
function AdminOrderCard({ order, onChangeStatus }) {
  return (
    <li className="rounded-sm border border-border">
      {/* <details>: abre e fecha sem JavaScript e funciona no teclado */}
      <details className="group">
        <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0">
            <p className="font-semibold">Pedido nº {order.number}</p>
            <p className="truncate text-sm text-muted-foreground">
              {formatOrderDate(order.createdAt)} · {order.customer.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
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

          <div className="mt-2 grid gap-4 border-t border-border pt-4 text-sm sm:grid-cols-3">
            <div className="min-w-0">
              <p className="font-semibold">Cliente</p>
              <p className="mt-1 text-muted-foreground">{order.customer.name}</p>
              <a href={`mailto:${order.customer.email}`} className="block truncate text-muted-foreground underline underline-offset-4 hover:text-foreground">
                {order.customer.email}
              </a>
              <a href={`tel:+55${order.customer.phone}`} className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
                {formatPhone(order.customer.phone)}
              </a>
            </div>
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

          <div className="mt-5 border-t border-border pt-4">
            <OrderStatusActions order={order} onChange={onChangeStatus} />
          </div>
        </div>
      </details>
    </li>
  )
}

export default AdminOrderCard
