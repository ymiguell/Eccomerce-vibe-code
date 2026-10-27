import { Link, Navigate, useLocation } from 'react-router'
import OrderItemList from '../components/checkout/OrderItemList.jsx'
import OrderTotals from '../components/checkout/OrderTotals.jsx'
import { formatPhone } from '../formatters/masks.js'
import { formatAddressLines, formatDelivery, formatPayment } from '../formatters/order.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' })

function InfoCard({ title, children }) {
  return (
    <div className="rounded-sm border border-border p-5">
      <h2 className="font-sans text-xs font-semibold tracking-widest text-accent uppercase">{title}</h2>
      <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">{children}</div>
    </div>
  )
}

/**
 * "Pedido confirmado" (/pedido-confirmado): número do pedido, entrega, pagamento e itens.
 * O pedido chega pelo `state` da navegação (vem do checkout). Sem ele (ex.: endereço digitado à mão), volta para a Home.
 */
function OrderConfirmationPage() {
  usePageTitle('Pedido confirmado')
  const order = useLocation().state?.order

  if (!order) return <Navigate to="/" replace />

  const firstName = order.customer.name.split(' ')[0]

  return (
    <main className="mx-auto max-w-3xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
      <div className="text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-on-primary">
          <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Pedido confirmado!</h1>
        <p className="mt-2 text-muted-foreground">
          Obrigado pela compra, {firstName}. Seu pedido é o <strong className="text-foreground">nº {order.number}</strong>.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Feito em {dateFormatter.format(new Date(order.createdAt))}</p>
        <p className="mx-auto mt-5 max-w-md rounded-sm bg-muted px-4 py-3 text-sm text-muted-foreground">
          Esta é uma loja de demonstração: nada foi cobrado e nenhum e-mail foi enviado. Numa loja real, a confirmação
          chegaria em <strong className="text-foreground">{order.customer.email}</strong>.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <InfoCard title="Entrega">
          <p className="font-medium text-foreground">{formatDelivery(order.delivery)}</p>
          {formatAddressLines(order.address).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </InfoCard>
        <InfoCard title="Pagamento e contato">
          <p className="font-medium text-foreground">{formatPayment(order.payment)}</p>
          <p>{order.customer.name}</p>
          <p>{formatPhone(order.customer.phone)}</p>
        </InfoCard>
      </div>

      <section aria-labelledby="order-items-title" className="mt-4 rounded-sm border border-border p-5">
        <h2 id="order-items-title" className="text-2xl font-semibold">
          Itens do pedido
        </h2>
        <div className="mt-2">
          <OrderItemList items={order.items} />
        </div>
        <div className="mt-2 border-t border-border pt-4">
          <OrderTotals totals={order.totals} coupon={order.coupon} payment={order.payment} />
        </div>
      </section>

      <div className="mt-10 text-center">
        <Link
          to="/"
          className="inline-block rounded-sm bg-primary px-8 py-3.5 text-sm font-semibold tracking-wide text-on-primary uppercase transition-colors duration-200 hover:bg-primary-hover"
        >
          Continuar comprando
        </Link>
      </div>
    </main>
  )
}

export default OrderConfirmationPage
