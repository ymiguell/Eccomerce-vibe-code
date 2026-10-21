import { useId, useState } from 'react'
import { normalizeCep } from '../../../domain/services/shipping.js'
import { formatPrice } from '../../formatters/currency.js'

// "01310100" → "01310-100" enquanto a pessoa digita
const formatCep = (value) => {
  const digits = normalizeCep(value)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

/** "Quando chega na sua casa?": prazo e valor do frete a partir do CEP. */
function ShippingCalculator({ subtotal, estimateShipping }) {
  const inputId = useId()
  const resultId = useId()
  const [cep, setCep] = useState('')
  const [result, setResult] = useState(null) // { estimate } | { error }
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setResult(await estimateShipping(cep, subtotal))
    setLoading(false)
  }

  const estimate = result?.estimate

  return (
    <div className="rounded-sm bg-muted p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <svg className="mt-0.5 size-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
          <circle cx="7" cy="17.5" r="1.75" />
          <circle cx="17.5" cy="17.5" r="1.75" />
        </svg>
        <div>
          <p className="font-semibold">Quando chega na sua casa?</p>
          <p className="text-sm text-muted-foreground">Calcule o prazo pelo seu CEP</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-4">
        <label htmlFor={inputId} className="sr-only">
          CEP
        </label>
        <div className="flex">
          <input
            id={inputId}
            value={cep}
            onChange={(event) => setCep(formatCep(event.target.value))}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            maxLength={9}
            aria-invalid={Boolean(result?.error)}
            aria-describedby={resultId}
            className="h-12 min-w-0 flex-1 rounded-l-sm border border-r-0 border-border bg-surface px-4 text-base aria-invalid:border-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 shrink-0 rounded-r-sm border border-primary bg-surface px-5 text-sm font-semibold tracking-wide text-primary uppercase transition-colors duration-200 hover:bg-primary hover:text-on-primary disabled:opacity-70"
          >
            {loading ? '…' : 'Calcular'}
          </button>
        </div>
      </form>

      <div id={resultId} aria-live="polite" className="text-sm">
        {result?.error && <p className="mt-2 font-medium text-primary">CEP inválido. Digite os 8 números do seu CEP.</p>}
        {estimate && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-sm bg-surface px-4 py-3">
            <p>
              <span className="font-semibold">
                Chega em {estimate.minDays} a {estimate.maxDays} dias úteis
              </span>
              <span className="block text-xs text-muted-foreground">Região {estimate.region}</span>
            </p>
            <p className={`shrink-0 font-semibold ${estimate.fee === 0 ? 'text-primary' : ''}`}>
              {estimate.fee === 0 ? 'Frete grátis' : formatPrice(estimate.fee)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <svg className="size-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
          </svg>
          <strong className="text-foreground">1ª troca grátis</strong> · postagem em até 2 dias úteis
        </p>
        <a
          href="https://buscacepinter.correios.com.br/app/endereco/index.php"
          target="_blank"
          rel="noopener noreferrer"
          className="py-1 font-medium underline underline-offset-2 hover:text-primary"
        >
          Não sei meu CEP
        </a>
      </div>
    </div>
  )
}

export default ShippingCalculator
