import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { validateForgotPassword } from '../../domain/entities/Account.js'
import AuthCard from '../components/account/AuthCard.jsx'
import FormField from '../components/form/FormField.jsx'
import { primaryButtonClass } from '../components/form/formStyles.js'
import { useAuthContext } from '../context/authContext.js'
import { formatAuthError } from '../formatters/authErrors.js'
import { useForm } from '../hooks/useForm.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

const linkClass = 'font-semibold text-primary underline underline-offset-4 hover:text-primary-hover'

/** Esqueci minha senha (/esqueci-a-senha): pede o e-mail e manda o link para criar uma senha nova. */
function ForgotPasswordPage() {
  usePageTitle('Esqueci minha senha')
  const auth = useAuthContext()
  const { state } = useLocation()
  // Vindo do "Entrar", já chega com o e-mail que o cliente tinha digitado
  const form = useForm({ email: state?.email ?? '' }, validateForgotPassword)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState(null)

  const handleRequest = async (values) => {
    setSending(true)
    setError('')
    const result = await auth.requestPasswordReset(values)
    setSending(false)
    if (result.sent) setSentTo(values.email.trim())
    else setError(result.errors ? 'Confira o e-mail e tente de novo.' : formatAuthError(result.error))
  }

  const footer = (
    <>
      Lembrou a senha?{' '}
      <Link to="/entrar" className={linkClass}>
        Entrar
      </Link>
    </>
  )

  if (sentTo) {
    return (
      <AuthCard title="Confira seu e-mail" footer={footer}>
        <div role="status" className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Se existir uma conta com <strong className="font-semibold break-all text-foreground">{sentTo}</strong>, você vai
            receber em alguns minutos um e-mail com o link para criar uma senha nova.
          </p>
          <p>O link vale por 1 hora. Não chegou? Confira a caixa de spam ou peça de novo.</p>
        </div>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="mt-5 min-h-11 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
        >
          Usar outro e-mail
        </button>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Esqueci minha senha"
      description="Informe o e-mail da sua conta. Vamos enviar um link para você criar uma senha nova."
      footer={footer}
    >
      <form onSubmit={form.handleSubmit(handleRequest)} noValidate className="space-y-4">
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

        {error && (
          <p role="alert" className="rounded-sm border border-primary bg-primary/5 p-3 text-sm font-medium text-primary">
            {error}
          </p>
        )}

        <button type="submit" disabled={sending} aria-busy={sending} className={`${primaryButtonClass} sm:w-full`}>
          {sending ? 'Enviando…' : 'Enviar link'}
        </button>
      </form>
    </AuthCard>
  )
}

export default ForgotPasswordPage
