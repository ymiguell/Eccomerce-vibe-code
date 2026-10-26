// Formato simples: algo@dominio.ext — a confirmação real acontece pelo e-mail enviado ao usuário
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function normalizeEmail(value) {
  return value.trim().toLowerCase()
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(normalizeEmail(value))
}
