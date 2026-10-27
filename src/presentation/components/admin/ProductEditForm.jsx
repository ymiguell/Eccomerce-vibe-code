import { useState } from 'react'
import { validateProductChanges } from '../../../domain/entities/Product.js'
import { formatAdminError } from '../../formatters/adminErrors.js'
import { formatMoneyInput, parseMoneyInput } from '../../formatters/currency.js'
import { useForm } from '../../hooks/useForm.js'
import FormField from '../form/FormField.jsx'
import { primaryButtonClass } from '../form/formStyles.js'

// Campos de texto → valores do domínio (preço original vazio = sem promoção)
const toChanges = (values) => ({
  price: parseMoneyInput(values.price),
  originalPrice: values.originalPrice.trim() ? parseMoneyInput(values.originalPrice) : null,
  stock: /^\d+$/.test(values.stock.trim()) ? Number(values.stock) : Number.NaN,
  isFeatured: values.isFeatured,
})

const validate = (values) => validateProductChanges(toChanges(values))

/** Edição de preço, promoção, estoque e destaque de um produto. `onSave(id, changes)` → { product } | { errors } | { error } */
function ProductEditForm({ product, onSave, onCancel }) {
  const form = useForm(
    {
      price: formatMoneyInput(product.price),
      originalPrice: product.originalPrice ? formatMoneyInput(product.originalPrice) : '',
      stock: String(product.stock),
      isFeatured: product.isFeatured,
    },
    validate,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (values) => {
    setSaving(true)
    setError('')
    const result = await onSave(product.id, toChanges(values))
    // Deu certo: o cartão fecha este formulário e mostra os valores novos
    if (!result.product) {
      setSaving(false)
      setError(result.errors ? 'Confira os campos destacados.' : formatAdminError(result.error))
    }
  }

  const moneyField = { inputMode: 'decimal', autoComplete: 'off', placeholder: '0,00' }

  return (
    <form onSubmit={form.handleSubmit(handleSave)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField form={form} name="price" label="Preço (R$)" {...moneyField} />
        <FormField
          form={form}
          name="originalPrice"
          label="Preço original (R$)"
          optional
          hint="Preencha para mostrar em promoção. Vazio tira da promoção."
          {...moneyField}
        />
        <FormField form={form} name="stock" label="Estoque" inputMode="numeric" autoComplete="off" />
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="isFeatured"
          checked={form.values.isFeatured}
          onChange={(event) => form.update('isFeatured', event.target.checked)}
          className="size-5 accent-primary"
        />
        Mostrar nos destaques da página inicial
      </label>

      <div aria-live="polite">
        {error && <p className="text-sm font-medium text-primary">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving} aria-busy={saving} className={primaryButtonClass}>
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="min-h-12 w-full rounded-sm border border-border px-6 text-sm font-semibold uppercase transition-colors duration-200 hover:border-foreground sm:w-auto sm:tracking-wide"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default ProductEditForm
