import { roundMoney } from '../entities/Coupon.js'

// Regras de pagamento da loja
export const MAX_INSTALLMENTS = 6
export const MIN_INSTALLMENT_VALUE = 30
export const PIX_DISCOUNT_PERCENT = 5

/** Parcelamento sem juros: até 6x, com parcela mínima de R$ 30. */
export function getInstallments(amount) {
  const count = Math.max(1, Math.min(MAX_INSTALLMENTS, Math.floor(amount / MIN_INSTALLMENT_VALUE)))
  return { count, value: roundMoney(amount / count) }
}

/** Preço pagando no Pix (5% de desconto). */
export function getPixPrice(amount) {
  return roundMoney(amount * (1 - PIX_DISCOUNT_PERCENT / 100))
}
