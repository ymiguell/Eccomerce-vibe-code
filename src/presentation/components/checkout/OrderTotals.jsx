import { PAYMENT_METHODS, PIX_DISCOUNT_PERCENT } from '../../../domain/services/payment.js'
import { formatPrice } from '../../formatters/currency.js'

/**
 * Subtotal, descontos, frete e total do pedido (ver calculateOrderTotals).
 * `payment` muda a linha de baixo: Pix, parcelas escolhidas ou o máximo de parcelas.
 */
function OrderTotals({ totals, coupon, payment }) {
  const installmentsNote =
    payment?.method === PAYMENT_METHODS.PIX
      ? 'no Pix'
      : payment?.method === PAYMENT_METHODS.CREDIT_CARD
        ? payment.installments === 1
          ? 'no cartão, à vista'
          : `em ${payment.installments}x de ${formatPrice(totals.total / payment.installments)} sem juros`
        : `ou até ${totals.installments}x de ${formatPrice(totals.installmentValue)} sem juros`

  return (
    <div>
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatPrice(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-accent">
            <dt>Cupom ({coupon.code})</dt>
            <dd>-{formatPrice(totals.discount)}</dd>
          </div>
        )}
        {totals.pixDiscount > 0 && (
          <div className="flex justify-between text-accent">
            <dt>Desconto Pix ({PIX_DISCOUNT_PERCENT}%)</dt>
            <dd>-{formatPrice(totals.pixDiscount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Frete</dt>
          <dd className={totals.shipping === null ? 'text-muted-foreground' : undefined}>
            {totals.shipping === null ? 'Calculado na entrega' : totals.shipping === 0 ? 'Grátis' : formatPrice(totals.shipping)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatPrice(totals.total)}</dd>
        </div>
      </dl>
      <p className="mt-1 text-right text-xs text-muted-foreground">{installmentsNote}</p>
    </div>
  )
}

export default OrderTotals
