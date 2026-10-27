/*
 * Regras de frete e prazo de entrega.
 * Prazo = postagem (até 2 dias úteis) + transporte, que depende da região do CEP.
 */

export const FREE_SHIPPING_THRESHOLD = 199
export const SHIPPING_FEE = 19.9
export const POSTING_DAYS = 2

// Prazo de transporte em dias úteis, por região
const TRANSIT_DAYS = {
  Sudeste: [2, 5],
  Sul: [3, 7],
  'Centro-Oeste': [3, 8],
  Nordeste: [5, 12],
  Norte: [7, 15],
}

// Faixas de CEP pelos 3 primeiros dígitos → região (simplificado a partir da tabela dos Correios)
const CEP_REGIONS = [
  [0, 399, 'Sudeste'], // SP, RJ, ES, MG
  [400, 659, 'Nordeste'], // BA, SE, PE, AL, PB, RN, CE, PI, MA
  [660, 699, 'Norte'], // PA, AP, AM, RR, AC
  [700, 767, 'Centro-Oeste'], // DF, GO
  [768, 779, 'Norte'], // RO, TO
  [780, 799, 'Centro-Oeste'], // MT, MS
  [800, 999, 'Sul'], // PR, SC, RS
]

/** Só os dígitos do CEP; válido se tiver exatamente 8. */
export function normalizeCep(value) {
  return value.replace(/\D/g, '').slice(0, 8)
}

export function isValidCep(value) {
  return normalizeCep(value).length === 8
}

export function getRegionByCep(value) {
  const prefix = Number(normalizeCep(value).slice(0, 3))
  return CEP_REGIONS.find(([min, max]) => prefix >= min && prefix <= max)?.[2] ?? null
}

export function hasFreeShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD
}

/*
 * Opção de frete: { id, name, company, price, minDays, maxDays }.
 * Os prazos são em dias úteis e já contam a postagem (até POSTING_DAYS).
 */

/** Opção da tabela da própria loja (sem transportadora): taxa fixa e prazo pela região do CEP. */
export function tableShippingOption(cep) {
  if (!isValidCep(cep)) throw new Error('CEP inválido')

  const [minTransit, maxTransit] = TRANSIT_DAYS[getRegionByCep(cep)]
  return Object.freeze({
    id: 'padrao',
    name: 'Entrega padrão',
    company: '',
    price: SHIPPING_FEE,
    minDays: minTransit,
    maxDays: maxTransit + POSTING_DAYS,
  })
}

// Quantas opções de frete o cliente vê no máximo (lista curta no celular)
export const MAX_SHIPPING_OPTIONS = 4

const byPrice = (a, b) => a.price - b.price || a.maxDays - b.maxDays
const bySpeed = (a, b) => a.maxDays - b.maxDays || a.price - b.price

/** Escolhe até `max` opções: sempre a mais barata e a mais rápida; o resto, as mais baratas. */
export function limitShippingOptions(options, max = MAX_SHIPPING_OPTIONS) {
  if (options.length <= max) return options
  const cheapest = [...options].sort(byPrice)
  const fastest = [...options].sort(bySpeed)[0]
  const picked = new Set([cheapest[0], fastest])
  for (const option of cheapest) {
    if (picked.size >= max) break
    picked.add(option)
  }
  return [...picked]
}

/** Ordena da mais barata para a mais cara. Com frete grátis, a mais barata sai de graça (as outras seguem pagas). */
export function applyFreeShipping(options, subtotal) {
  const sorted = [...options].sort(byPrice)
  const free = hasFreeShipping(subtotal)
  return sorted.map((option, index) => Object.freeze({ ...option, price: free && index === 0 ? 0 : option.price }))
}
