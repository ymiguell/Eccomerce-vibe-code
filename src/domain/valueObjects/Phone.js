// Telefone brasileiro com DDD: 10 números (fixo) ou 11 (celular)
export function normalizePhone(value) {
  return value.replace(/\D/g, '').slice(0, 11)
}

export function isValidPhone(value) {
  const digits = normalizePhone(value)
  return digits.length === 10 || digits.length === 11
}
