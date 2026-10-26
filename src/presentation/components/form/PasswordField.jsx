import { useId, useState } from 'react'
import { fieldClass } from './formStyles.js'

function EyeIcon({ open }) {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="M4 4l16 16" />}
    </svg>
  )
}

/**
 * Campo de senha ligado ao useForm, com botão para mostrar/esconder o que foi digitado.
 * `autoComplete`: "current-password" no login, "new-password" no cadastro (ajuda o gerenciador de senhas).
 * Colar e gerenciadores de senha funcionam normalmente.
 */
function PasswordField({ form, name = 'password', label = 'Senha', autoComplete, hint }) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const error = form.errorFor(name)
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={form.values[name]}
          onChange={(event) => form.update(name, event.target.value)}
          onBlur={() => form.touch(name)}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${fieldClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}
          aria-pressed={visible}
          className="absolute top-1.5 right-0 flex size-11 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <EyeIcon open={visible} />
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-primary">
          {error}
        </p>
      )}
    </div>
  )
}

export default PasswordField
