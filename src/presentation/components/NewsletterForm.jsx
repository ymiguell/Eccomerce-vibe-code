import { useId, useState } from 'react'

const errorMessages = {
  invalid_email: 'Digite um e-mail válido, como nome@exemplo.com.',
  already_subscribed: 'Este e-mail já está inscrito. Fique de olho na sua caixa de entrada!',
  too_many_requests: 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.',
}
const fallbackMessage = 'Não conseguimos fazer sua inscrição agora. Tente de novo em instantes.'

function NewsletterForm({ onSubscribe }) {
  const inputId = useId()
  const messageId = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')

    let result
    try {
      result = await onSubscribe(email)
    } catch (error) {
      console.error('Falha na inscrição da newsletter:', error)
      result = { error: 'unknown' }
    }

    if (result.error) {
      setError(errorMessages[result.error] ?? fallbackMessage)
      setStatus('error')
    } else {
      setEmail('')
      setStatus('success')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="rounded-sm border border-white/30 bg-white/10 px-5 py-4">
        <p className="font-semibold text-white">Inscrição confirmada!</p>
        <p className="mt-1 text-sm text-white/85">
          Use o cupom <strong className="tracking-wider text-white underline underline-offset-4">BEMVINDO10</strong> e ganhe 10% na primeira compra.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <label htmlFor={inputId} className="text-sm font-medium text-white">
        Seu melhor e-mail
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nome@exemplo.com"
          aria-invalid={status === 'error'}
          aria-describedby={messageId}
          className="h-12 min-w-0 flex-1 rounded-sm border border-white/40 bg-white/10 px-4 text-base text-white placeholder:text-white/70 aria-invalid:border-white aria-invalid:border-2"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="h-12 shrink-0 rounded-sm bg-white px-6 text-sm font-semibold tracking-wide text-primary uppercase transition-colors duration-200 hover:bg-red-50 disabled:cursor-wait disabled:opacity-70"
        >
          {status === 'loading' ? 'Enviando…' : 'Quero receber'}
        </button>
      </div>
      <p id={messageId} role={status === 'error' ? 'alert' : undefined} className="mt-2 text-sm">
        {status === 'error' ? (
          <span className="font-semibold text-white">{error}</span>
        ) : (
          <span className="text-white/80">Sem spam. Você pode cancelar quando quiser.</span>
        )}
      </p>
    </form>
  )
}

export default NewsletterForm
