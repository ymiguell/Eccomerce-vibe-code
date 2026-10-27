import { useId, useState } from 'react'
import { Link } from 'react-router'
import { validateNewProduct } from '../../../domain/entities/Product.js'
import { formatAdminError } from '../../formatters/adminErrors.js'
import { parseMoneyInput } from '../../formatters/currency.js'
import { useForm } from '../../hooks/useForm.js'
import { NICHE_PAGES } from '../../pages/nichePages.js'
import FormField from '../form/FormField.jsx'
import { fieldClass, primaryButtonClass } from '../form/formStyles.js'
import PhotoPicker from './PhotoPicker.jsx'

const INITIAL = {
  photo: null,
  name: '',
  niche: '',
  category: '',
  description: '',
  price: '',
  originalPrice: '',
  stock: '',
  fabric: '',
  sizes: '',
  colors: '',
  isFeatured: false,
}

const clean = (text) => text.trim().replace(/\s+/g, ' ')
// "P, M,  G, M" → ['P', 'M', 'G']
const splitOptions = (text) => [...new Set(text.split(',').map(clean).filter(Boolean))]

// Campos de texto → dados do produto (preço original vazio = sem promoção)
const toProductInput = (values) => ({
  name: clean(values.name),
  niche: values.niche,
  category: clean(values.category),
  description: values.description.trim(),
  sizes: splitOptions(values.sizes),
  colors: splitOptions(values.colors),
  fabric: clean(values.fabric),
  price: parseMoneyInput(values.price),
  originalPrice: values.originalPrice.trim() ? parseMoneyInput(values.originalPrice) : null,
  stock: /^\d+$/.test(values.stock.trim()) ? Number(values.stock) : Number.NaN,
  isFeatured: values.isFeatured,
})

const validate = (values) => validateNewProduct({ ...toProductInput(values), hasPhoto: Boolean(values.photo) })

/**
 * Cadastro de produto novo no painel. `categoriesByNiche` sugere as categorias que já existem em cada área.
 * `onCreate(input)` → { product } | { errors } | { error }; dando certo, `onCreated(product)`.
 */
function NewProductForm({ categoriesByNiche, onCreate, onCreated }) {
  const form = useForm(INITIAL, validate)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const descriptionId = useId()
  const categoriesId = useId()

  const handleCreate = async (values) => {
    setSending(true)
    setError('')
    const result = await onCreate({ ...toProductInput(values), photo: values.photo })
    if (result.product) return onCreated(result.product)
    setSending(false)
    setError(result.errors ? 'Confira os campos destacados.' : formatAdminError(result.error))
  }

  const moneyField = { inputMode: 'decimal', autoComplete: 'off', placeholder: '0,00' }
  const descriptionError = form.errorFor('description')

  return (
    <form onSubmit={form.handleSubmit(handleCreate)} noValidate className="space-y-5">
      <PhotoPicker name="photo" error={form.errorFor('photo')} onChange={(photo) => form.update('photo', photo)} />

      <FormField form={form} name="name" label="Nome do produto" autoComplete="off" placeholder="Ex.: Camiseta Básica Algodão" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField form={form} name="niche" label="Área da loja">
          <option value="" disabled>
            Escolha…
          </option>
          {NICHE_PAGES.map((niche) => (
            <option key={niche.slug} value={niche.slug}>
              {niche.title}
            </option>
          ))}
        </FormField>
        {/* Sugere as categorias que já existem na área escolhida (dá para digitar uma nova) */}
        <FormField
          form={form}
          name="category"
          label="Categoria"
          autoComplete="off"
          placeholder="Ex.: Camisetas"
          list={categoriesId}
        />
        <datalist id={categoriesId}>
          {(categoriesByNiche[form.values.niche] ?? []).map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </div>

      <div>
        <label htmlFor={descriptionId} className="text-sm font-medium">
          Descrição <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id={descriptionId}
          name="description"
          rows={4}
          value={form.values.description}
          onChange={(event) => form.update('description', event.target.value)}
          onBlur={() => form.touch('description')}
          aria-invalid={Boolean(descriptionError)}
          aria-describedby={descriptionError ? `${descriptionId}-error` : undefined}
          className={`${fieldClass} h-auto py-2.5 leading-relaxed`}
        />
        {descriptionError && (
          <p id={`${descriptionId}-error`} className="mt-1 text-sm text-primary">
            {descriptionError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField form={form} name="price" label="Preço (R$)" {...moneyField} />
        <FormField
          form={form}
          name="originalPrice"
          label="Preço original (R$)"
          optional
          hint="Preencha para mostrar em promoção."
          {...moneyField}
        />
        <FormField form={form} name="stock" label="Estoque" inputMode="numeric" autoComplete="off" placeholder="0" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField form={form} name="sizes" label="Tamanhos" optional autoComplete="off" hint="Separe por vírgula. Ex.: P, M, G" />
        <FormField form={form} name="colors" label="Cores" optional autoComplete="off" hint="Separe por vírgula. Ex.: Preto, Branco" />
        <FormField form={form} name="fabric" label="Tecido ou material" optional autoComplete="off" placeholder="Ex.: Algodão" />
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

      <div aria-live="polite">{error && <p className="text-sm font-medium text-primary">{error}</p>}</div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" disabled={sending} aria-busy={sending} className={primaryButtonClass}>
          {sending ? 'Cadastrando…' : 'Cadastrar produto'}
        </button>
        <Link
          to="/admin/produtos"
          className="inline-flex min-h-12 items-center justify-center rounded-sm border border-border px-6 text-sm font-semibold uppercase transition-colors duration-200 hover:border-foreground sm:tracking-wide"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}

export default NewProductForm
