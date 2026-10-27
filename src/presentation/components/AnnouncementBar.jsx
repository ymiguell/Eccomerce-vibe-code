import { Link } from 'react-router'
import { getBlackFridayStatus, getTimeRemaining } from '../../domain/services/blackFriday.js'
import { useNow } from '../hooks/useNow.js'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' })
const pad = (value) => String(value).padStart(2, '0')

function Bolt() {
  return (
    <svg className="size-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  )
}

// Cada unidade do relógio: número em destaque + letra (d, h, m, s)
function TimeUnit({ value, unit }) {
  return (
    <span className="inline-flex items-baseline">
      <span className="rounded-sm bg-white/10 px-1 font-bold">{pad(value)}</span>
      <span className="ml-0.5 text-white/70">{unit}</span>
    </span>
  )
}

/**
 * Faixa acima da NavBar com contagem regressiva para a Black Friday.
 * Semanas antes: "A Black Friday está chegando" + relógio. Durante: "A Black Friday começou" + tempo até acabar.
 * Fora dessa janela a faixa some.
 */
function AnnouncementBar() {
  const now = useNow()
  const status = getBlackFridayStatus(now)
  if (status.phase === 'off') return null
  const isLive = status.phase === 'live'
  const remaining = getTimeRemaining(isLive ? status.endsAt : status.startsAt, now)

  return (
    <div className="bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-xs font-semibold tracking-wide uppercase sm:px-6 sm:text-sm lg:px-8">
        <p className="flex items-center gap-2">
          <Bolt />
          {isLive ? (
            <span>A Black Friday começou: ofertas por tempo limitado</span>
          ) : (
            <span>
              A Black Friday está chegando
              <span className="hidden sm:inline"> · prepare sua sacola</span>
            </span>
          )}
          <Bolt />
        </p>

        {/* role="timer" não é anunciado a cada segundo; o texto escondido dá o contexto uma vez */}
        <p role="timer" className="flex items-center gap-1.5 tabular-nums">
          <span className="sr-only">
            {isLive ? 'Termina em' : `Começa em ${dateFormatter.format(status.startsAt)}. Faltam`}
          </span>
          <span className="font-normal text-white/70" aria-hidden="true">
            {isLive ? 'Termina em' : 'Faltam'}
          </span>
          <TimeUnit value={remaining.days} unit="d" />
          <TimeUnit value={remaining.hours} unit="h" />
          <TimeUnit value={remaining.minutes} unit="m" />
          <TimeUnit value={remaining.seconds} unit="s" />
        </p>

        <Link
          to="/outlet"
          // Texto branco com sublinhado vermelho: o vermelho puro sobre preto não tem contraste suficiente para texto pequeno
          className="inline-flex min-h-8 items-center rounded-sm text-white underline decoration-primary decoration-2 underline-offset-4 hover:decoration-white"
        >
          {isLive ? 'Aproveitar' : 'Ver ofertas'}
        </Link>
      </div>
    </div>
  )
}

export default AnnouncementBar
