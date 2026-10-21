import { useId, useState } from 'react'
import { formatPrice } from '../formatters/currency.js'

const errorMessages = {
  empty: () => 'Digite o código do cupom.',
  not_found: () => 'Cupom inválido ou expirado.',
  min_subtotal: (coupon) => `Este cupom vale para compras a partir de ${formatPrice(coupon.minSubtotal)}.`,
}

function CouponForm({ coupon, discount, onApply, onRemove }) {
  const inputId = useId()
  const errorId = useId()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    const result = await onApply(code)

    setLoading(false)
    if (result.error) {
      setError(errorMessages[result.error](result.coupon))
    } else {
      setError('')
      setCode('')
    }
  }

  // Cupom já aplicado: mostra o código e a opção de remover
  if (coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-sm border border-dashed border-accent bg-accent/5 px-4 py-3">
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-accent">{coupon.code}</p>
          <p className="text-muted-foreground">
            {discount > 0 ? coupon.description : `Mínimo de ${formatPrice(coupon.minSubtotal)} não atingido`}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 px-2 py-3 text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Remover
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor={inputId} className="text-sm font-medium">
        Cupom de desconto
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id={inputId}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Digite seu cupom"
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="h-11 min-w-0 flex-1 rounded-sm border border-border bg-surface px-3 text-base uppercase placeholder:normal-case placeholder:text-muted-foreground aria-invalid:border-sale sm:text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-11 shrink-0 rounded-sm border border-primary px-4 text-sm font-medium transition-colors duration-200 hover:bg-primary hover:text-on-primary disabled:opacity-50"
        >
          {loading ? 'Aplicando…' : 'Aplicar'}
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-sale">
          {error}
        </p>
      )}
    </form>
  )
}

export default CouponForm
