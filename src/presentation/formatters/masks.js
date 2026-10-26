import { normalizeCep } from '../../domain/services/shipping.js'
import { normalizePhone } from '../../domain/valueObjects/Phone.js'

// Máscaras aplicadas enquanto a pessoa digita

/** "01310100" → "01310-100" */
export function formatCep(value) {
  const digits = normalizeCep(value)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

/** "11987654321" → "(11) 98765-4321"; com 10 números, "(11) 4000-0000" */
export function formatPhone(value) {
  const digits = normalizePhone(value)
  if (digits.length <= 2) return digits
  const ddd = `(${digits.slice(0, 2)}) `
  if (digits.length <= 6) return ddd + digits.slice(2)

  const splitAt = digits.length === 11 ? 7 : 6
  return `${ddd}${digits.slice(2, splitAt)}-${digits.slice(splitAt)}`
}
