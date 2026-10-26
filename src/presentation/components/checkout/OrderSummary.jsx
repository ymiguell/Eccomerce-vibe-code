import { useId, useState } from 'react'
import { formatPrice } from '../../formatters/currency.js'
import CouponForm from '../CouponForm.jsx'
import OrderItemList from './OrderItemList.jsx'
import OrderTotals from './OrderTotals.jsx'

/**
 * Resumo do pedido no checkout: itens, cupom e valores.
 * No celular fica recolhido no topo (mostra só o total); no desktop, aberto na coluna da direita.
 */
function OrderSummary({ cart, totals, payment }) {
  const contentId = useId()
  const [open, setOpen] = useState(false)
  const itemsLabel = `${cart.count} ${cart.count === 1 ? 'item' : 'itens'}`

  return (
    <section aria-label="Resumo do pedido" className="rounded-sm border border-border bg-surface">
      {/* Celular: botão que abre/fecha o resumo */}
      <h2 className="font-sans lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            Resumo ({itemsLabel})
            <svg
              className={`size-4 transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
          <span className="text-base font-semibold">{formatPrice(totals.total)}</span>
        </button>
      </h2>

      {/* Desktop: título fixo */}
      <div className="hidden items-baseline justify-between border-b border-border px-5 py-4 lg:flex">
        <h2 className="text-2xl font-semibold">Resumo do pedido</h2>
        <button
          type="button"
          onClick={cart.openCart}
          className="min-h-11 px-1 text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Editar sacola
        </button>
      </div>

      <div id={contentId} className={`${open ? '' : 'hidden'} border-t border-border px-4 pb-5 sm:px-5 lg:block lg:border-t-0`}>
        <OrderItemList items={cart.items} />

        <div className="flex justify-end lg:hidden">
          <button
            type="button"
            onClick={cart.openCart}
            className="min-h-11 px-1 text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Editar sacola
          </button>
        </div>

        <div className="border-t border-border py-4">
          <CouponForm coupon={cart.coupon} discount={totals.discount} onApply={cart.redeemCoupon} onRemove={cart.removeCoupon} />
        </div>

        <div className="border-t border-border pt-4">
          <OrderTotals totals={totals} coupon={cart.coupon} payment={payment} />
        </div>
      </div>
    </section>
  )
}

export default OrderSummary
