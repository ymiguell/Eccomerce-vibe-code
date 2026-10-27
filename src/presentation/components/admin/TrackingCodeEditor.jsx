import { useState } from 'react'
import { formatAdminError } from '../../formatters/adminErrors.js'
import { fieldClass } from '../form/formStyles.js'
import TrackingCode from '../order/TrackingCode.jsx'

const buttonClass =
  'min-h-11 rounded-sm border border-border px-4 text-sm font-semibold transition-colors duration-200 hover:border-foreground disabled:opacity-60'

/**
 * Rastreio de pedido já enviado, no painel: mostra o código e permite informar ou corrigir (vazio apaga).
 * `onSave(order, code)` → { order } | { errors } | { error }
 */
function TrackingCodeEditor({ order, onSave }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(order.trackingCode ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const result = await onSave(order, value)
    setSaving(false)
    if (result.order) setEditing(false)
    else setError(result.errors?.trackingCode ?? formatAdminError(result.error))
  }

  if (!editing) {
    return (
      <div className="text-sm">
        {order.trackingCode ? (
          <TrackingCode code={order.trackingCode} />
        ) : (
          <p className="text-muted-foreground">Sem código de rastreio.</p>
        )}
        <button
          type="button"
          onClick={() => {
            setValue(order.trackingCode ?? '')
            setEditing(true)
          }}
          className={`${buttonClass} mt-2`}
        >
          {order.trackingCode ? 'Corrigir rastreio' : 'Informar rastreio'}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={save} className="max-w-sm text-sm">
      <label htmlFor={`tracking-edit-${order.id}`} className="font-medium">
        Código de rastreio
      </label>
      <input
        id={`tracking-edit-${order.id}`}
        value={value}
        onChange={(event) => setValue(event.target.value.toUpperCase())}
        autoFocus
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={40}
        placeholder="AA123456789BR"
        aria-invalid={Boolean(error)}
        className={`${fieldClass} font-mono`}
      />
      <div aria-live="polite">{error && <p className="mt-1 font-medium text-primary">{error}</p>}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className={`${buttonClass} border-primary bg-primary text-on-primary hover:bg-primary-hover`}>
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
        <button type="button" onClick={() => setEditing(false)} disabled={saving} className={buttonClass}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default TrackingCodeEditor
