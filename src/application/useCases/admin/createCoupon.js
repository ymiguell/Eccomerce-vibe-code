import { validateCoupon } from '../../../domain/entities/Coupon.js'

/**
 * Caso de uso (painel): criar um cupom (já nasce ativo). O código vai em maiúsculas.
 * Retorna { coupon }, { errors } (campo → mensagem) ou { error } (ex.: code_taken).
 */
export function makeCreateCoupon(adminRepository) {
  return async function createCoupon(input) {
    const coupon = { ...input, code: input.code.trim().toUpperCase(), description: input.description.trim() }
    const errors = validateCoupon(coupon)
    if (Object.keys(errors).length > 0) return { errors }

    const result = await adminRepository.createCoupon(coupon)
    if (result.fields) return { errors: result.fields }
    return result
  }
}
