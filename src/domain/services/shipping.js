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

/** Prazo de entrega (já com a postagem) de cada região, para tabelas informativas. */
export function getDeliveryWindows() {
  return Object.entries(TRANSIT_DAYS).map(([region, [minTransit, maxTransit]]) => ({
    region,
    minDays: minTransit,
    maxDays: maxTransit + POSTING_DAYS,
  }))
}

export function hasFreeShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD
}

/**
 * Estimativa de entrega para um CEP e um valor de compra.
 * Retorna { region, minDays, maxDays, fee } ou lança erro se o CEP for inválido.
 */
export function estimateShipping(cep, subtotal) {
  if (!isValidCep(cep)) throw new Error('CEP inválido')

  const region = getRegionByCep(cep)
  const [minTransit, maxTransit] = TRANSIT_DAYS[region]

  return {
    region,
    minDays: minTransit,
    maxDays: maxTransit + POSTING_DAYS,
    fee: hasFreeShipping(subtotal) ? 0 : SHIPPING_FEE,
  }
}
