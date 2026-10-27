/**
 * Cupom de desconto. `type` pode ser 'percent' (value = %) ou 'fixed' (value = R$).
 * `minSubtotal` é o valor mínimo da compra para o cupom valer.
 */
export function createCoupon({ code, type, value, minSubtotal = 0, description = '' }) {
  if (!code || !['percent', 'fixed'].includes(type)) {
    throw new Error('Cupom inválido: code e type (percent | fixed) são obrigatórios')
  }

  if (typeof value !== 'number' || value <= 0) {
    throw new Error(`Cupom inválido: value deve ser positivo (${code})`)
  }

  return Object.freeze({ code: code.toUpperCase(), type, value, minSubtotal, description })
}

export const COUPON_TYPES = Object.freeze(['percent', 'fixed'])
const CODE_PATTERN = /^[A-Z0-9]{3,20}$/

/**
 * Confere um cupom novo criado no painel (o código já em maiúsculas).
 * Retorna { campo: mensagem } — vazio quando está tudo certo.
 */
export function validateCoupon({ code, type, value, minSubtotal, description = '' }) {
  const errors = {}

  if (!CODE_PATTERN.test(code)) errors.code = 'Use de 3 a 20 letras ou números, sem espaços.'
  if (!COUPON_TYPES.includes(type)) errors.type = 'Escolha o tipo de desconto.'

  if (!Number.isFinite(value) || value <= 0) {
    errors.value = 'Informe um desconto maior que zero.'
  } else if (type === 'percent' && value > 100) {
    errors.value = 'O desconto em % vai até 100.'
  }

  if (!Number.isFinite(minSubtotal) || minSubtotal < 0) errors.minSubtotal = 'Informe um valor mínimo, zero ou mais.'
  if (description.length > 120) errors.description = 'Use até 120 caracteres.'

  return errors
}

export function isCouponApplicable(coupon, subtotal) {
  return subtotal >= coupon.minSubtotal
}

/** Valor em R$ que o cupom desconta. Nunca maior que o próprio subtotal. */
export function getCouponDiscount(coupon, subtotal) {
  if (!coupon || !isCouponApplicable(coupon, subtotal)) return 0

  const discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value
  return Math.min(roundMoney(discount), subtotal)
}

export function roundMoney(value) {
  return Math.round(value * 100) / 100
}
