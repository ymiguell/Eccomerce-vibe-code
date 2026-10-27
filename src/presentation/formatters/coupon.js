import { formatPrice } from './currency.js'

/** Ex.: "10% de desconto" ou "R$ 20,00 de desconto" */
export function formatCouponValue(coupon) {
  const value = coupon.type === 'percent' ? `${coupon.value}%` : formatPrice(coupon.value)
  return `${value} de desconto`
}
