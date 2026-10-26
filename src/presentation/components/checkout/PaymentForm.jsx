import { useId, useState } from 'react'
import {
  PAYMENT_METHODS,
  PIX_DISCOUNT_PERCENT,
  getInstallmentOptions,
  validatePayment,
} from '../../../domain/services/payment.js'
import { formatPrice } from '../../formatters/currency.js'
import { fieldClass, primaryButtonClass } from './checkoutStyles.js'

const optionClass =
  'flex cursor-pointer items-start gap-3 rounded-sm border border-border p-4 transition-colors duration-200 hover:border-foreground has-checked:border-primary has-checked:bg-primary/5'

function DemoNotice() {
  return (
    <p className="flex gap-2.5 rounded-sm bg-muted p-3.5 text-sm text-muted-foreground">
      <svg className="mt-0.5 size-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
      <span>
        <strong className="text-foreground">Loja de demonstração:</strong> nenhum valor é cobrado e nenhum produto é
        enviado. Por isso não pedimos dados de cartão; numa loja real eles seriam digitados no ambiente seguro do meio de
        pagamento.
      </span>
    </p>
  )
}

/**
 * Etapa 3 do checkout: Pix (com desconto) ou cartão de crédito em até 6x.
 * Controlado pela página: a escolha muda o resumo do pedido na hora.
 * `totalsFor(payment)` devolve os valores do pedido para uma forma de pagamento (calculateOrderTotals).
 */
function PaymentForm({ payment, onChange, totalsFor, onSubmit, submitting, submitError }) {
  const baseId = useId()
  const [attempted, setAttempted] = useState(false)

  const pixTotal = totalsFor({ method: PAYMENT_METHODS.PIX }).total
  const cardTotal = totalsFor({ method: PAYMENT_METHODS.CREDIT_CARD }).total
  const installmentOptions = getInstallmentOptions(cardTotal)
  const total = totalsFor(payment).total

  const errors = validatePayment(payment, total)
  const methodError = attempted ? errors.method : undefined

  const handleSubmit = (event) => {
    event.preventDefault()
    setAttempted(true)
    if (Object.keys(errors).length > 0) {
      event.currentTarget.querySelector('input[name="method"]')?.focus()
      return
    }
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <fieldset aria-describedby={methodError ? `${baseId}-error` : undefined}>
        <legend className="text-sm font-medium">Como você quer pagar?</legend>

        <div className="mt-2 space-y-3">
          <label className={optionClass}>
            <input
              type="radio"
              name="method"
              value={PAYMENT_METHODS.PIX}
              checked={payment.method === PAYMENT_METHODS.PIX}
              onChange={() => onChange({ method: PAYMENT_METHODS.PIX, installments: 1 })}
              className="mt-1 size-4 accent-primary"
            />
            <span className="flex-1">
              <span className="flex flex-wrap items-center justify-between gap-x-3">
                <span className="font-semibold">Pix</span>
                <span className="font-semibold">{formatPrice(pixTotal)}</span>
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {PIX_DISCOUNT_PERCENT}% de desconto nos produtos · aprovação na hora
              </span>
            </span>
          </label>

          <label className={optionClass}>
            <input
              type="radio"
              name="method"
              value={PAYMENT_METHODS.CREDIT_CARD}
              checked={payment.method === PAYMENT_METHODS.CREDIT_CARD}
              onChange={() => onChange({ method: PAYMENT_METHODS.CREDIT_CARD, installments: installmentOptions.length })}
              className="mt-1 size-4 accent-primary"
            />
            <span className="flex-1">
              <span className="flex flex-wrap items-center justify-between gap-x-3">
                <span className="font-semibold">Cartão de crédito</span>
                <span className="font-semibold">{formatPrice(cardTotal)}</span>
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                Em até {installmentOptions.length}x sem juros
              </span>
            </span>
          </label>
        </div>

        {methodError && (
          <p id={`${baseId}-error`} className="mt-2 text-sm text-primary">
            {methodError}
          </p>
        )}
      </fieldset>

      {payment.method === PAYMENT_METHODS.CREDIT_CARD && (
        <div>
          <label htmlFor={`${baseId}-installments`} className="text-sm font-medium">
            Parcelas
          </label>
          <select
            id={`${baseId}-installments`}
            value={payment.installments}
            onChange={(event) => onChange({ ...payment, installments: Number(event.target.value) })}
            className={fieldClass}
          >
            {installmentOptions.map((option) => (
              <option key={option.count} value={option.count}>
                {option.count === 1
                  ? `À vista: ${formatPrice(option.value)}`
                  : `${option.count}x de ${formatPrice(option.value)} sem juros`}
              </option>
            ))}
          </select>
        </div>
      )}

      <DemoNotice />

      {submitError && (
        <p role="alert" className="rounded-sm border border-primary bg-primary/5 p-3.5 text-sm font-medium text-primary">
          {submitError}
        </p>
      )}

      <button type="submit" disabled={submitting} aria-busy={submitting} className={`${primaryButtonClass} sm:w-full`}>
        {submitting ? 'Finalizando pedido…' : `Finalizar pedido · ${formatPrice(total)}`}
      </button>
    </form>
  )
}

export default PaymentForm
