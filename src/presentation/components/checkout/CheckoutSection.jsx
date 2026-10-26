/**
 * Uma etapa do checkout.
 * - Atual: mostra o formulário (children).
 * - Concluída: mostra o resumo do que foi preenchido e o botão "Alterar".
 * - Próxima: só o título, apagado.
 * O título recebe o foco quando a etapa abre (ver CheckoutPage), para quem usa teclado ou leitor de tela.
 */
function CheckoutSection({ number, title, status, summary, onEdit, children }) {
  return (
    <section
      aria-labelledby={`etapa-${number}`}
      className={`rounded-sm border p-5 sm:p-6 ${status === 'current' ? 'border-foreground' : 'border-border'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id={`etapa-${number}`}
          tabIndex={-1}
          className={`flex items-center gap-3 text-xl font-semibold focus:outline-none sm:text-2xl ${
            status === 'upcoming' ? 'text-muted-foreground' : ''
          }`}
        >
          <span
            className={`flex size-7 shrink-0 items-center justify-center rounded-full font-sans text-sm font-bold ${
              status === 'upcoming' ? 'bg-muted text-muted-foreground' : 'bg-primary text-on-primary'
            }`}
            aria-hidden="true"
          >
            {number}
          </span>
          {title}
        </h2>

        {status === 'done' && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Alterar ${title.toLowerCase()}`}
            className="min-h-11 px-2 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
          >
            Alterar
          </button>
        )}
      </div>

      {status === 'done' && <div className="mt-3 pl-10 text-sm text-muted-foreground">{summary}</div>}
      {status === 'current' && <div className="mt-5">{children}</div>}
    </section>
  )
}

export default CheckoutSection
