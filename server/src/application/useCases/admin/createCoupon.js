import { roundMoney, validateCoupon } from '../../../domain/entities/Coupon.js'

/**
 * Caso de uso (painel): criar um cupom (já nasce ativo). O código é guardado em maiúsculas.
 * Retorna { coupon } ou { error: 'invalid_data' | 'code_taken', fields? }.
 */
export function makeCreateCoupon(couponRepository) {
  return async function createCoupon({ code, type, value, minSubtotal = 0, description = '' }) {
    const coupon = {
      code: code.trim().toUpperCase(),
      type,
      value: roundMoney(value),
      minSubtotal: roundMoney(minSubtotal),
      description: description.trim(),
    }

    const fields = validateCoupon(coupon)
    if (Object.keys(fields).length > 0) return { error: 'invalid_data', fields }
    if (await couponRepository.exists(coupon.code)) return { error: 'code_taken' }

    return { coupon: await couponRepository.create(coupon) }
  }
}
