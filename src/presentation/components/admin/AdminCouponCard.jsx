import { useState } from 'react'
import { formatAdminError } from '../../formatters/adminErrors.js'
import { formatCouponValue } from '../../formatters/coupon.js'
import { formatPrice } from '../../formatters/currency.js'

/**
 * Cupom no painel: código, desconto, mínimo, quantas vezes foi usado e se está valendo.
 * Desativar não apaga (pedidos antigos continuam com ele) e dá para reativar, por isso não pede confirmação.
 * `onToggle(code, active)` → { coupon } | { error }
 */
function AdminCouponCard({ coupon, onToggle }) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const toggle = async () => {
    setSending(true)
    setError('')
    const result = await onToggle(coupon.code, !coupon.active)
    setSending(false)
    if (!result.coupon) setError(formatAdminError(result.error))
  }

  return (
    <li className={`rounded-sm border border-border p-4 sm:p-5 ${coupon.active ? '' : 'bg-muted/60'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-base font-semibold tracking-wide">{coupon.code}</p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                coupon.active ? 'bg-primary/10 text-primary' : 'border border-border text-muted-foreground'
              }`}
            >
              {coupon.active ? 'Ativo' : 'Desativado'}
            </span>
          </div>
          <p className="mt-1 text-sm">
            {formatCouponValue(coupon)}
            {coupon.minSubtotal > 0 && ` · compras a partir de ${formatPrice(coupon.minSubtotal)}`}
          </p>
          {coupon.description && <p className="mt-0.5 text-sm text-muted-foreground">{coupon.description}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            Usado em {coupon.timesUsed} {coupon.timesUsed === 1 ? 'pedido' : 'pedidos'}
          </p>
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={sending}
          className="min-h-11 shrink-0 rounded-sm border border-border px-4 text-sm font-semibold transition-colors duration-200 hover:border-foreground disabled:opacity-60"
        >
          {sending ? 'Salvando…' : coupon.active ? 'Desativar' : 'Ativar'}
        </button>
      </div>

      <div aria-live="polite">{error && <p className="mt-2 text-sm font-medium text-primary">{error}</p>}</div>
    </li>
  )
}

export default AdminCouponCard
