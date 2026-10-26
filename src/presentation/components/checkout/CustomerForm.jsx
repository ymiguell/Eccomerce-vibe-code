import { validateCustomer } from '../../../domain/entities/Customer.js'
import { formatPhone } from '../../formatters/masks.js'
import { useForm } from '../../hooks/useForm.js'
import { primaryButtonClass } from './checkoutStyles.js'
import FormField from './FormField.jsx'

const EMPTY_CUSTOMER = { name: '', email: '', phone: '' }

/** Etapa 1 do checkout: nome, e-mail e celular. */
function CustomerForm({ initialValues = EMPTY_CUSTOMER, onSubmit }) {
  const form = useForm(initialValues, validateCustomer)

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
      <FormField form={form} name="name" label="Nome completo" autoComplete="name" className="sm:col-span-2" />
      <FormField
        form={form}
        name="email"
        label="E-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
      />
      <FormField
        form={form}
        name="phone"
        label="Celular com DDD"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="(11) 98765-4321"
        format={formatPhone}
        maxLength={15}
      />

      <div className="sm:col-span-2">
        <button type="submit" className={primaryButtonClass}>
          Ir para a entrega
        </button>
      </div>
    </form>
  )
}

export default CustomerForm
