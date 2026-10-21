const ratingFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** 4.7 → "4,7" */
export function formatRating(value) {
  return ratingFormatter.format(value)
}

/** "2026-03-05" → "05/03/2026" (sem passar por Date, para não mudar o dia por causa do fuso horário) */
export function formatReviewDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}
