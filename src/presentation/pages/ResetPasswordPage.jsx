import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { MIN_PASSWORD_LENGTH, validateNewPassword } from '../../domain/entities/Account.js'
import AuthCard from '../components/account/AuthCard.jsx'
import PasswordField from '../components/form/PasswordField.jsx'
import { primaryButtonClass } from '../components/form/formStyles.js'
import { useAuthContext } from '../context/authContext.js'
import { formatAuthError } from '../formatters/authErrors.js'
import { useForm } from '../hooks/useForm.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

const linkClass = 'font-semibold text-primary underline underline-offset-4 hover:text-primary-hover'

/** Criar senha nova (/redefinir-senha?token=...), aberta pelo link do e-mail de "esqueci minha senha". */
function ResetPasswordPage() {
  usePageTitle('Criar senha nova')
  const auth = useAuthContext()
  const [params] = useSearchParams()
  const token = params.get('token')
  const form = useForm({ password: '' }, validateNewPassword)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const requestAgain = (
    <Link to="/esqueci-a-senha" className={linkClass}>
      Pedir um novo link
    </Link>
  )

  if (!token) {
    return (
      <AuthCard title="Link incompleto" footer={requestAgain}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Abra o link exatamente como chegou no e-mail. Se ele não funcionar, peça um novo.
        </p>
      </AuthCard>
    )
  }

  if (done) {
    return (
      <AuthCard title="Senha alterada">
        <p role="status" className="text-sm leading-relaxed text-muted-foreground">
          Pronto! Você já está conectado com a senha nova. Por segurança, saímos da sua conta nos outros aparelhos.
        </p>
        <Link to="/minha-conta" className={`${primaryButtonClass} mt-6 inline-flex items-center justify-center sm:w-full`}>
          Ir para Minha conta
        </Link>
      </AuthCard>
    )
  }

  const handleReset = async ({ password }) => {
    setSending(true)
    setError(null)
    const result = await auth.resetPassword({ token, password })
    setSending(false)
    if (result.customer) setDone(true)
    else setError(result.errors ? { message: 'Confira a senha nova e tente de novo.' } : { code: result.error, message: formatAuthError(result.error) })
  }

  return (
    <AuthCard title="Criar senha nova" description="Escolha a senha que você vai usar para entrar na loja.">
      <form onSubmit={form.handleSubmit(handleReset)} noValidate className="space-y-4">
        <PasswordField
          form={form}
          label="Senha nova"
          autoComplete="new-password"
          hint={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres, com letras e números.`}
        />

        {error && (
          <div role="alert" className="rounded-sm border border-primary bg-primary/5 p-3 text-sm font-medium text-primary">
            <p>{error.message}</p>
            {error.code === 'invalid_token' && <p className="mt-2">{requestAgain}</p>}
          </div>
        )}

        <button type="submit" disabled={sending} aria-busy={sending} className={`${primaryButtonClass} sm:w-full`}>
          {sending ? 'Salvando…' : 'Salvar senha nova'}
        </button>
      </form>
    </AuthCard>
  )
}

export default ResetPasswordPage
