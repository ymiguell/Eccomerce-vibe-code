import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { validateLogin } from '../../domain/entities/Account.js'
import AuthCard from '../components/account/AuthCard.jsx'
import FormField from '../components/form/FormField.jsx'
import PasswordField from '../components/form/PasswordField.jsx'
import { primaryButtonClass } from '../components/form/formStyles.js'
import { useAuthContext } from '../context/authContext.js'
import { formatAuthError } from '../formatters/authErrors.js'
import { useForm } from '../hooks/useForm.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { safeRedirect } from '../navigation/safeRedirect.js'

/**
 * Entrar (/entrar). Depois do login volta para onde o cliente estava (?voltar=/checkout) ou vai para "Minha conta".
 */
function LoginPage() {
  usePageTitle('Entrar')
  const auth = useAuthContext()
  const [params] = useSearchParams()
  const redirectTo = safeRedirect(params.get('voltar'))
  const form = useForm({ email: '', password: '' }, validateLogin)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  // Já logado (ou acabou de entrar): segue para o destino
  if (auth.customer) return <Navigate to={redirectTo} replace />

  const handleLogin = async (values) => {
    setSending(true)
    setError('')
    const result = await auth.login(values)
    if (!result.customer) {
      setSending(false)
      setError(formatAuthError(result.error))
    }
  }

  const registerLink = `/cadastro${params.get('voltar') ? `?voltar=${encodeURIComponent(redirectTo)}` : ''}`

  return (
    <AuthCard
      title="Entrar"
      description="Acompanhe seus pedidos e compre mais rápido."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link to={registerLink} className="font-semibold text-primary underline underline-offset-4 hover:text-primary-hover">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(handleLogin)} noValidate className="space-y-4">
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
        <div>
          <PasswordField form={form} autoComplete="current-password" />
          {/* Leva o e-mail já digitado para não precisar digitar de novo */}
          <div className="flex justify-end">
            <Link
              to="/esqueci-a-senha"
              state={{ email: form.values.email }}
              className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors duration-200 hover:text-foreground"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-sm border border-primary bg-primary/5 p-3 text-sm font-medium text-primary">
            {error}
          </p>
        )}

        <button type="submit" disabled={sending} aria-busy={sending} className={`${primaryButtonClass} sm:w-full`}>
          {sending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthCard>
  )
}

export default LoginPage
