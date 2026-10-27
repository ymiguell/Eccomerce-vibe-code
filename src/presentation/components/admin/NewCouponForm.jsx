import { useState } from 'react'
import { validateCoupon } from '../../../domain/entities/Coupon.js'
import { formatAdminError } from '../../formatters/adminErrors.js'
import { parseMoneyInput } from '../../formatters/currency.js'
import { useForm } from '../../hooks/useForm.js'
import FormField from '../form/FormField.jsx'
import { primaryButtonClass } from '../form/formStyles.js'

const INITIAL_VALUES = { code: '', type: 'percent', value: '', minSubtotal: '', description: '' }

// Campos de texto → cupom do domínio (mínimo vazio = sem mínimo)
const toCoupon = (values) => ({
  code: values.code.trim().toUpperCase(),
  type: values.type,
  value: parseMoneyInput(values.value),
  minSubtotal: values.minSubtotal.trim() ? parseMoneyInput(values.minSubtotal) : 0,
  description: values.description.trim(),
})

const validate = (values) => validateCoupon(toCoupon(values))

/** Criar cupom. `onCreate(coupon)` → { coupon } | { errors } | { error }. Depois de criar, o formulário volta vazio (nova `key`). */
function NewCouponForm({ onCreate }) {
  const form = useForm(INITIAL_VALUES, validate)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (values) => {
    setSending(true)
    setError('')
    const result = await onCreate(toCoupon(values))
    if (!result.coupon) {
      setSending(false)
      setError(result.errors ? 'Confira os campos destacados.' : formatAdminError(result.error))
    }
  }

  const isPercent = form.values.type === 'percent'

  return (
    <form onSubmit={form.handleSubmit(handleCreate)} noValidate className="space-y-4">
      {/* Dois campos por linha no tablet; no computador o formulário fica numa coluna estreita, então volta a um por linha */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <FormField
          form={form}
          name="code"
          label="Código"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          placeholder="NATAL15"
          format={(value) => value.toUpperCase().replace(/\s/g, '')}
        />
        <FormField form={form} name="type" label="Tipo de desconto">
          <option value="percent">Porcentagem (%)</option>
          <option value="fixed">Valor fixo (R$)</option>
        </FormField>
        <FormField
          form={form}
          name="value"
          label={isPercent ? 'Desconto (%)' : 'Desconto (R$)'}
          inputMode="decimal"
          autoComplete="off"
          placeholder={isPercent ? '10' : '20,00'}
        />
        <FormField
          form={form}
          name="minSubtotal"
          label="Compra mínima (R$)"
          optional
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
        />
      </div>
      <FormField
        form={form}
        name="description"
        label="Descrição para o cliente"
        optional
        maxLength={120}
        placeholder="10% de desconto na primeira compra"
        hint="Aparece na sacola quando o cupom é aplicado."
      />

      <div aria-live="polite">{error && <p className="text-sm font-medium text-primary">{error}</p>}</div>

      <button type="submit" disabled={sending} aria-busy={sending} className={primaryButtonClass}>
        {sending ? 'Criando…' : 'Criar cupom'}
      </button>
    </form>
  )
}

export default NewCouponForm
