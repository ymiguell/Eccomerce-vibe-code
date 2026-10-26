import { CHECKOUT_STEPS } from './checkoutStyles.js'

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

/** Barra de progresso do checkout: 1 Identificação — 2 Entrega — 3 Pagamento. */
function CheckoutSteps({ current }) {
  return (
    <nav aria-label="Etapas da compra">
      <ol className="flex items-center gap-2 sm:gap-3">
        {CHECKOUT_STEPS.map((label, index) => {
          const number = index + 1
          const status = number < current ? 'done' : number === current ? 'current' : 'upcoming'
          const isLast = number === CHECKOUT_STEPS.length

          return (
            <li
              key={label}
              aria-current={status === 'current' ? 'step' : undefined}
              className={`flex items-center gap-2 ${isLast ? '' : 'flex-1'}`}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:size-8 sm:text-sm ${
                  status === 'done'
                    ? 'bg-primary text-on-primary'
                    : status === 'current'
                      ? 'border-2 border-primary text-primary'
                      : 'border border-border text-muted-foreground'
                }`}
              >
                {status === 'done' ? <CheckIcon className="size-4" /> : number}
              </span>
              {/* No celular só o nome da etapa atual aparece (as outras ficam com o número); o leitor de tela lê todos */}
              <span
                className={`text-xs font-semibold sm:text-sm ${status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'} ${
                  status === 'current' ? '' : 'sr-only sm:not-sr-only'
                }`}
              >
                {label}
                {status === 'done' && <span className="sr-only"> (concluída)</span>}
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`h-0.5 min-w-3 flex-1 rounded-full ${status === 'done' ? 'bg-primary' : 'bg-border'}`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default CheckoutSteps
