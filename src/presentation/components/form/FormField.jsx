import { useId } from 'react'
import { fieldClass } from './formStyles.js'

/**
 * Campo de formulário ligado ao useForm: rótulo visível, máscara opcional (`format`) e erro logo abaixo.
 * Com `children`, vira um <select> (as <option> vêm em children). O resto das props vai para o <input>.
 */
function FormField({ form, name, label, optional = false, format = (value) => value, onValueChange, hint, className = '', children, ...inputProps }) {
  const id = useId()
  const error = form.errorFor(name)
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

  const control = {
    id,
    name,
    value: form.values[name],
    onChange: (event) => {
      const value = format(event.target.value)
      form.update(name, value)
      onValueChange?.(value)
    },
    onBlur: () => form.touch(name),
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
    className: fieldClass,
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground"> (opcional)</span>}
      </label>
      {children ? <select {...control}>{children}</select> : <input {...control} {...inputProps} />}
      {hint && (
        <div id={`${id}-hint`} aria-live="polite" className="mt-1 text-sm text-muted-foreground">
          {hint}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-primary">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
