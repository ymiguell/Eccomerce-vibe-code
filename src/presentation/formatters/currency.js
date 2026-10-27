const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatPrice(value) {
  return priceFormatter.format(value)
}

/** Valor para um campo de texto do painel, sem "R$": 199.9 → "199,90" */
export function formatMoneyInput(value) {
  return value.toFixed(2).replace('.', ',')
}

/**
 * Valor digitado → número. Aceita "199,90", "1.299,90" e "199.90"; vazio ou inválido → NaN
 * (a regra do domínio transforma o NaN em mensagem de erro).
 */
export function parseMoneyInput(text) {
  const cleaned = text.replace(/R\$|\s/g, '')
  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned
  return /^\d+(\.\d{1,2})?$/.test(normalized) ? Number(normalized) : Number.NaN
}
