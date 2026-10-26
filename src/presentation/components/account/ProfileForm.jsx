import { useState } from 'react'
import { validateProfile } from '../../../domain/entities/Account.js'
import { formatAuthError } from '../../formatters/authErrors.js'
import { formatPhone } from '../../formatters/masks.js'
import { useForm } from '../../hooks/useForm.js'
import FormField from '../form/FormField.jsx'
import { fieldClass, primaryButtonClass } from '../form/formStyles.js'

/** "Meus dados": nome e celular editáveis; o e-mail é o login e aparece só para leitura. */
function ProfileForm({ customer, onSave }) {
  const form = useForm({ name: customer.name, phone: formatPhone(customer.phone) }, validateProfile)
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [error, setError] = useState('')

  const handleSave = async (values) => {
    setStatus('saving')
    const result = await onSave(values)
    if (result.customer) {
      setStatus('saved')
    } else {
      setStatus('error')
      setError(result.errors ? 'Confira nome e celular.' : formatAuthError(result.error))
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSave)} noValidate className="space-y-4">
      <FormField form={form} name="name" label="Nome completo" autoComplete="name" />
      <div>
        <label htmlFor="profile-email" className="text-sm font-medium">
          E-mail
        </label>
        <input id="profile-email" value={customer.email} readOnly className={`${fieldClass} bg-muted text-muted-foreground`} />
      </div>
      <FormField
        form={form}
        name="phone"
        label="Celular com DDD"
        optional
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="(11) 98765-4321"
        format={formatPhone}
        maxLength={15}
      />

      <div aria-live="polite" className="text-sm">
        {status === 'saved' && <p className="font-medium text-foreground">Dados salvos.</p>}
        {status === 'error' && <p className="font-medium text-primary">{error}</p>}
      </div>

      <button type="submit" disabled={status === 'saving'} className={primaryButtonClass}>
        {status === 'saving' ? 'Salvando…' : 'Salvar dados'}
      </button>
    </form>
  )
}

export default ProfileForm
