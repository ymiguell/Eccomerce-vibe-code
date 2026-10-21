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
