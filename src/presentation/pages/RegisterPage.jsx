import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { MIN_PASSWORD_LENGTH, validateRegistration } from '../../domain/entities/Account.js'
import AuthCard from '../components/account/AuthCard.jsx'
import FormField from '../components/form/FormField.jsx'
import PasswordField from '../components/form/PasswordField.jsx'
import { primaryButtonClass } from '../components/form/formStyles.js'
import { useAuthContext } from '../context/authContext.js'
import { formatAuthError } from '../formatters/authErrors.js'
import { useForm } from '../hooks/useForm.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { safeRedirect } from '../navigation/safeRedirect.js'

/** Criar conta (/cadastro). Dando certo, o cliente já entra e segue para onde estava (?voltar=) ou "Minha conta". */
function RegisterPage() {
  usePageTitle('Criar conta')
  const auth = useAuthContext()
  const [params] = useSearchParams()
  const redirectTo = safeRedirect(params.get('voltar'))
  const form = useForm({ name: '', email: '', password: '' }, validateRegistration)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  if (auth.customer) return <Navigate to={redirectTo} replace />

  const handleRegister = async (values) => {
    setSending(true)
    setError('')
    const result = await auth.register(values)
    if (!result.customer) {
      setSending(false)
      // Campos recusados pelo servidor são raros (as regras são as mesmas daqui): mostra um aviso geral
      setError(result.errors ? 'Confira nome, e-mail e senha e tente de novo.' : formatAuthError(result.error))
    }
  }

  const loginLink = `/entrar${params.get('voltar') ? `?voltar=${encodeURIComponent(redirectTo)}` : ''}`

  return (
    <AuthCard
      title="Criar conta"
      description="Leva menos de um minuto. Seus pedidos ficam salvos em “Minha conta”."
      footer={
        <>
          Já tem conta?{' '}
          <Link to={loginLink} className="font-semibold text-primary underline underline-offset-4 hover:text-primary-hover">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(handleRegister)} noValidate className="space-y-4">
        <FormField form={form} name="name" label="Nome completo" autoComplete="name" />
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
        <PasswordField
          form={form}
          autoComplete="new-password"
          hint={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres, com letras e números.`}
        />

        {error && (
          <p role="alert" className="rounded-sm border border-primary bg-primary/5 p-3 text-sm font-medium text-primary">
            {error}
          </p>
        )}

        <button type="submit" disabled={sending} aria-busy={sending} className={`${primaryButtonClass} sm:w-full`}>
          {sending ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>
    </AuthCard>
  )
}

export default RegisterPage
