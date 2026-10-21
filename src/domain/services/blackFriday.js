/*
 * Regras da campanha de Black Friday.
 * A Black Friday é a última sexta-feira de novembro; a campanha vai até o domingo seguinte.
 * Datas no horário local do cliente.
 */

const FRIDAY = 5
const CAMPAIGN_DAYS = 3 // sexta, sábado e domingo

/** Última sexta-feira de novembro do ano informado, à meia-noite. */
export function getBlackFridayDate(year) {
  const date = new Date(year, 10, 30) // 30 de novembro (mês 10 = novembro)
  while (date.getDay() !== FRIDAY) date.setDate(date.getDate() - 1)
  return date
}

/**
 * Situação da campanha em um momento:
 * - 'upcoming': ainda não começou; `startsAt` é quando começa.
 * - 'live': está acontecendo; `endsAt` é quando termina.
 * Depois que a campanha do ano acaba, passa a contar para a do ano seguinte.
 */
export function getBlackFridayStatus(now) {
  const year = now.getFullYear()

  for (const candidateYear of [year, year + 1]) {
    const startsAt = getBlackFridayDate(candidateYear)
    const endsAt = new Date(startsAt)
    endsAt.setDate(endsAt.getDate() + CAMPAIGN_DAYS)

    if (now < startsAt) return { phase: 'upcoming', startsAt, endsAt }
    if (now < endsAt) return { phase: 'live', startsAt, endsAt }
  }
}

/** Tempo que falta até `target`, separado em dias, horas, minutos e segundos (nunca negativo). */
export function getTimeRemaining(target, now) {
  const totalSeconds = Math.max(0, Math.floor((target - now) / 1000))

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}
