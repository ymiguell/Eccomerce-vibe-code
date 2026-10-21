import { isCouponApplicable } from '../../domain/entities/Coupon.js'

/**
 * Caso de uso: validar um cupom para o subtotal atual.
 * Retorna { coupon } em caso de sucesso ou { error } com o motivo:
 * 'empty' | 'not_found' | 'min_subtotal' (neste caso, também devolve o cupom para exibir o mínimo).
 */
export function makeApplyCoupon(couponRepository) {
  return async function applyCoupon(code, subtotal) {
    if (!code.trim()) return { error: 'empty' }

    const coupon = await couponRepository.findByCode(code)
    if (!coupon) return { error: 'not_found' }

    if (!isCouponApplicable(coupon, subtotal)) return { error: 'min_subtotal', coupon }

    return { coupon }
  }
}
