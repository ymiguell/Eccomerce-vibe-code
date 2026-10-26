import { useState } from 'react'

/**
 * Estado de um formulário validado por uma regra do domínio (validate → { campo: mensagem }).
 * O erro de cada campo aparece ao sair dele ou depois de tentar enviar.
 * Envio com erro: o foco vai para o primeiro campo inválido, na ordem da tela.
 */
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const errors = validate(values)

  const handleSubmit = (onValid) => (event) => {
    event.preventDefault()
    setSubmitted(true)

    const firstInvalid = [...event.currentTarget.elements].find((element) => errors[element.name])
    if (firstInvalid) {
      firstInvalid.focus()
      return
    }

    onValid(values)
  }

  return {
    values,
    errorFor: (field) => (touched[field] || submitted ? errors[field] : undefined),
    update: (field, value) => setValues((current) => ({ ...current, [field]: value })),
    // Vários campos de uma vez (ex.: endereço preenchido pelo CEP)
    fill: (partial) => setValues((current) => ({ ...current, ...partial })),
    touch: (field) => setTouched((current) => ({ ...current, [field]: true })),
    handleSubmit,
  }
}
