import { useEffect, useId, useRef, useState } from 'react'
import { MAX_COMMENT_LENGTH, validateReviewInput } from '../../../domain/entities/Review.js'

const EMPTY = { author: '', rating: 0, comment: '' }
const STAR_PATH =
  'M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.53L12 17.5l-5.87 3.07 1.12-6.53L2.5 9.41l6.56-.95L12 2.5z'

/**
 * Formulário "Escrever avaliação".
 * - Valida cada campo ao sair dele (regras no domínio: validateReviewInput).
 * - Se o envio falhar, mostra um resumo dos erros no topo e leva o foco até ele.
 */
function ReviewForm({ onSubmit, onCancel }) {
  const baseId = useId()
  const ids = { author: `${baseId}-author`, rating: `${baseId}-rating-1`, comment: `${baseId}-comment` }
  const summaryRef = useRef(null)

  const [values, setValues] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [attempts, setAttempts] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [sending, setSending] = useState(false)

  const errors = validateReviewInput(values)
  const errorFor = (field) => (touched[field] || attempts > 0 ? errors[field] : undefined)
  const visibleErrors = ['author', 'rating', 'comment'].filter((field) => errorFor(field))

  // Depois de um envio com erro, o foco vai para o resumo (leitores de tela anunciam a lista)
  useEffect(() => {
    if (attempts > 0) summaryRef.current?.focus()
  }, [attempts])

  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }))
  const touch = (field) => setTouched((current) => ({ ...current, [field]: true }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (Object.keys(errors).length > 0) {
      setAttempts((count) => count + 1)
      return
    }
    setSending(true)
    await onSubmit(values)
    setSending(false)
  }

  const focusField = (event, field) => {
    event.preventDefault()
    document.getElementById(ids[field])?.focus()
  }

  const shownRating = hoverRating || values.rating
  const fieldClass =
    'mt-1.5 w-full rounded-sm border border-border bg-surface px-3 text-base aria-invalid:border-primary sm:text-sm'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-sm border border-border p-5 sm:p-6">
      <p className="text-lg font-semibold">Escreva sua avaliação</p>

      {attempts > 0 && visibleErrors.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-sm border border-primary bg-primary/5 p-4 text-sm focus:outline-none">
          <p className="font-semibold text-primary">Corrija {visibleErrors.length === 1 ? 'o campo' : 'os campos'} abaixo:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {visibleErrors.map((field) => (
              <li key={field}>
                <a href={`#${ids[field]}`} onClick={(event) => focusField(event, field)} className="underline underline-offset-2">
                  {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label htmlFor={ids.author} className="text-sm font-medium">
          Seu nome
        </label>
        <input
          id={ids.author}
          value={values.author}
          onChange={(event) => update('author', event.target.value)}
          onBlur={() => touch('author')}
          autoComplete="name"
          aria-invalid={Boolean(errorFor('author'))}
          aria-describedby={errorFor('author') ? `${ids.author}-error` : undefined}
          className={`${fieldClass} h-11`}
        />
        {errorFor('author') && (
          <p id={`${ids.author}-error`} className="mt-1 text-sm text-primary">
            {errorFor('author')}
          </p>
        )}
      </div>

      <fieldset onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && touch('rating')}>
        <legend className="text-sm font-medium">Sua nota</legend>
        <div className="mt-1 flex" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((stars) => (
            <label key={stars} className="cursor-pointer p-1" onMouseEnter={() => setHoverRating(stars)}>
              <input
                id={`${baseId}-rating-${stars}`}
                type="radio"
                name={`${baseId}-rating`}
                value={stars}
                checked={values.rating === stars}
                onChange={() => update('rating', stars)}
                aria-describedby={errorFor('rating') ? `${baseId}-rating-error` : undefined}
                className="peer sr-only"
              />
              <span className="sr-only">
                {stars} {stars === 1 ? 'estrela' : 'estrelas'}
              </span>
              <svg
                className={`size-8 rounded-sm transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                  stars <= shownRating ? 'text-amber-400' : 'text-border'
                }`}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d={STAR_PATH} />
              </svg>
            </label>
          ))}
        </div>
        {errorFor('rating') && (
          <p id={`${baseId}-rating-error`} className="mt-1 text-sm text-primary">
            {errorFor('rating')}
          </p>
        )}
      </fieldset>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor={ids.comment} className="text-sm font-medium">
            Comentário
          </label>
          <span className="text-xs text-muted-foreground">
            {values.comment.trim().length}/{MAX_COMMENT_LENGTH}
          </span>
        </div>
        <textarea
          id={ids.comment}
          rows={4}
          value={values.comment}
          onChange={(event) => update('comment', event.target.value)}
          onBlur={() => touch('comment')}
          maxLength={MAX_COMMENT_LENGTH}
          placeholder="Conte o que achou do produto, da qualidade e da entrega"
          aria-invalid={Boolean(errorFor('comment'))}
          aria-describedby={errorFor('comment') ? `${ids.comment}-error` : undefined}
          className={`${fieldClass} py-2.5 placeholder:text-muted-foreground`}
        />
        {errorFor('comment') && (
          <p id={`${ids.comment}-error`} className="mt-1 text-sm text-primary">
            {errorFor('comment')}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={sending}
          className="min-h-11 rounded-sm bg-primary px-6 text-sm font-semibold tracking-wide text-on-primary uppercase transition-colors duration-200 hover:bg-primary-hover disabled:opacity-70"
        >
          {sending ? 'Publicando…' : 'Publicar avaliação'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-sm border border-border px-6 text-sm font-semibold tracking-wide uppercase transition-colors duration-200 hover:border-foreground"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default ReviewForm
