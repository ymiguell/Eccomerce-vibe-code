import { useState } from 'react'
import { ORDER_STATUS_TRANSITIONS } from '../../../domain/entities/Order.js'
import { formatAdminError } from '../../formatters/adminErrors.js'
import { formatStatusAction } from '../../formatters/order.js'
import { fieldClass } from '../form/formStyles.js'

const buttonBase = 'min-h-11 rounded-sm px-4 text-sm font-semibold transition-colors duration-200 disabled:opacity-60'
const primaryButton = `${buttonBase} bg-primary text-on-primary hover:bg-primary-hover`
const outlineButton = `${buttonBase} border border-border hover:border-foreground`

// Passos que pedem confirmação antes: cancelar (não tem volta) e enviar (pede o rastreio)
const CONFIRM_STEPS = ['canceled', 'shipped']

/**
 * Botões com os próximos passos do pedido (ex.: "Marcar como enviado").
 * Cancelar pede confirmação, porque não tem volta e devolve os produtos ao estoque.
 * Enviar abre o campo do código de rastreio (opcional).
 * `onChange(order, status, { trackingCode })` retorna { order }, { errors } ou { error }.
 */
function OrderStatusActions({ order, onChange }) {
  const [sending, setSending] = useState(null) // situação sendo enviada
  const [confirming, setConfirming] = useState(null) // 'canceled' | 'shipped' | null
  const [trackingCode, setTrackingCode] = useState('')
  const [error, setError] = useState('')

  const next = ORDER_STATUS_TRANSITIONS[order.status] ?? []
  if (next.length === 0) {
    return <p className="text-sm text-muted-foreground">Pedido finalizado: não há próximos passos.</p>
  }

  const change = async (status, options) => {
    setSending(status)
    setError('')
    // Deu certo: a lista é atualizada e este pedido aparece com a nova situação (e os novos botões)
    const result = await onChange(order, status, options)
    setSending(null)
    if (result.order) {
      setConfirming(null)
    } else {
      setError(result.errors?.trackingCode ?? formatAdminError(result.error))
    }
  }

  const ask = (status) => (CONFIRM_STEPS.includes(status) ? setConfirming(status) : change(status))
  const forward = next.filter((status) => status !== 'canceled')
  const canCancel = next.includes('canceled')
  const busy = Boolean(sending)

  return (
    <div>
      {confirming === 'canceled' && (
        <div role="alertdialog" aria-labelledby={`cancel-${order.id}`} className="rounded-sm border border-primary bg-primary/5 p-4">
          <p id={`cancel-${order.id}`} className="text-sm font-semibold">
            Cancelar o pedido nº {order.number}?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Os produtos voltam para o estoque. Não dá para desfazer.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => change('canceled')} disabled={busy} className={primaryButton}>
              {sending === 'canceled' ? 'Cancelando…' : 'Sim, cancelar'}
            </button>
            {/* autoFocus: o foco cai na opção segura */}
            <button type="button" autoFocus onClick={() => setConfirming(null)} disabled={busy} className={outlineButton}>
              Voltar
            </button>
          </div>
        </div>
      )}

      {confirming === 'shipped' && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            change('shipped', { trackingCode })
          }}
          className="rounded-sm border border-border p-4"
        >
          <label htmlFor={`tracking-${order.id}`} className="text-sm font-medium">
            Código de rastreio <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            id={`tracking-${order.id}`}
            value={trackingCode}
            onChange={(event) => setTrackingCode(event.target.value.toUpperCase())}
            autoFocus
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={40}
            placeholder="AA123456789BR"
            aria-invalid={Boolean(error)}
            className={`${fieldClass} font-mono`}
          />
          <p className="mt-1 text-sm text-muted-foreground">O cliente vê o código em "Minha conta".</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="submit" disabled={busy} className={primaryButton}>
              {sending === 'shipped' ? 'Salvando…' : 'Confirmar envio'}
            </button>
            <button type="button" onClick={() => setConfirming(null)} disabled={busy} className={outlineButton}>
              Voltar
            </button>
          </div>
        </form>
      )}

      {!confirming && (
        <div className="flex flex-wrap gap-2">
          {forward.map((status) => (
            <button key={status} type="button" onClick={() => ask(status)} disabled={busy} className={primaryButton}>
              {sending === status ? 'Salvando…' : formatStatusAction(status)}
            </button>
          ))}
          {canCancel && (
            <button type="button" onClick={() => ask('canceled')} disabled={busy} className={`${outlineButton} text-primary`}>
              {formatStatusAction('canceled')}
            </button>
          )}
        </div>
      )}

      <div aria-live="polite">{error && <p className="mt-2 text-sm font-medium text-primary">{error}</p>}</div>
    </div>
  )
}

export default OrderStatusActions
