import { useState } from 'react'
import { ORDER_STATUS_TRANSITIONS } from '../../../domain/entities/Order.js'
import { formatAdminError } from '../../formatters/adminErrors.js'
import { formatStatusAction } from '../../formatters/order.js'

const buttonBase = 'min-h-11 rounded-sm px-4 text-sm font-semibold transition-colors duration-200 disabled:opacity-60'
const primaryButton = `${buttonBase} bg-primary text-on-primary hover:bg-primary-hover`
const outlineButton = `${buttonBase} border border-border hover:border-foreground`

/**
 * Botões com os próximos passos do pedido (ex.: "Marcar como enviado").
 * Cancelar pede confirmação antes, porque não tem volta e devolve os produtos ao estoque.
 * `onChange(order, status)` retorna { order } ou { error }.
 */
function OrderStatusActions({ order, onChange }) {
  const [sending, setSending] = useState(null) // situação sendo enviada
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [error, setError] = useState('')

  const next = ORDER_STATUS_TRANSITIONS[order.status] ?? []
  if (next.length === 0) {
    return <p className="text-sm text-muted-foreground">Pedido finalizado: não há próximos passos.</p>
  }

  const change = async (status) => {
    setSending(status)
    setError('')
    // Deu certo: a lista é atualizada e este pedido aparece com a nova situação (e os novos botões)
    const result = await onChange(order, status)
    setSending(null)
    setConfirmingCancel(false)
    if (!result.order) setError(formatAdminError(result.error))
  }

  const forward = next.filter((status) => status !== 'canceled')
  const canCancel = next.includes('canceled')

  return (
    <div>
      {confirmingCancel ? (
        <div role="alertdialog" aria-labelledby={`cancel-${order.id}`} className="rounded-sm border border-primary bg-primary/5 p-4">
          <p id={`cancel-${order.id}`} className="text-sm font-semibold">
            Cancelar o pedido nº {order.number}?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Os produtos voltam para o estoque. Não dá para desfazer.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => change('canceled')} disabled={Boolean(sending)} className={primaryButton}>
              {sending === 'canceled' ? 'Cancelando…' : 'Sim, cancelar'}
            </button>
            {/* autoFocus: o foco cai na opção segura */}
            <button type="button" autoFocus onClick={() => setConfirmingCancel(false)} disabled={Boolean(sending)} className={outlineButton}>
              Voltar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {forward.map((status) => (
            <button key={status} type="button" onClick={() => change(status)} disabled={Boolean(sending)} className={primaryButton}>
              {sending === status ? 'Salvando…' : formatStatusAction(status)}
            </button>
          ))}
          {canCancel && (
            <button type="button" onClick={() => setConfirmingCancel(true)} disabled={Boolean(sending)} className={`${outlineButton} text-primary`}>
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
