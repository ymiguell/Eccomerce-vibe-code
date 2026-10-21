import { formatRating } from '../../formatters/rating.js'

const STAR_PATH =
  'M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.53L12 17.5l-5.87 3.07 1.12-6.53L2.5 9.41l6.56-.95L12 2.5z'

function Stars({ className }) {
  return Array.from({ length: 5 }, (_, index) => (
    <svg key={index} className={`shrink-0 ${className}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={STAR_PATH} />
    </svg>
  ))
}

/**
 * Estrelas de nota (somente leitura). Preenche frações: 4,7 → 4 estrelas e 70% da quinta.
 * Para leitores de tela vira um único texto, ex.: "Nota 4,7 de 5".
 */
function StarRating({ value, size = 'size-4' }) {
  return (
    <span role="img" aria-label={`Nota ${formatRating(value)} de 5`} className="relative inline-flex">
      <span className="flex text-border">
        <Stars className={size} />
      </span>
      <span className="absolute inset-0 flex overflow-hidden text-amber-400" style={{ width: `${(value / 5) * 100}%` }}>
        <Stars className={size} />
      </span>
    </span>
  )
}

export default StarRating
