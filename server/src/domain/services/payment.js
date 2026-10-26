import { roundMoney } from '../entities/Coupon.js'

// Regras de pagamento da loja
export const MAX_INSTALLMENTS = 6
export const MIN_INSTALLMENT_VALUE = 30
export const PIX_DISCOUNT_PERCENT = 5

export const PAYMENT_METHODS = Object.freeze({ PIX: 'pix', CREDIT_CARD: 'credit_card' })

/** Parcelamento sem juros: até 6x, com parcela mínima de R$ 30. */
export function getInstallments(amount) {
  const count = Math.max(1, Math.min(MAX_INSTALLMENTS, Math.floor(amount / MIN_INSTALLMENT_VALUE)))
  return { count, value: roundMoney(amount / count) }
}

/** Todas as opções de parcelamento para o valor: 1x, 2x... até o máximo permitido. */
export function getInstallmentOptions(amount) {
  const { count: max } = getInstallments(amount)
  return Array.from({ length: max }, (_, index) => ({ count: index + 1, value: roundMoney(amount / (index + 1)) }))
}

/** Preço pagando no Pix (5% de desconto). */
export function getPixPrice(amount) {
  return roundMoney(amount * (1 - PIX_DISCOUNT_PERCENT / 100))
}

/**
 * Valida a forma de pagamento escolhida para o total do pedido.
 * Retorna um objeto { campo: mensagem } — vazio quando está tudo certo.
 */
export function validatePayment({ method = null, installments = 1 }, total) {
  const errors = {}

  if (!Object.values(PAYMENT_METHODS).includes(method)) errors.method = 'Escolha a forma de pagamento.'

  if (method === PAYMENT_METHODS.CREDIT_CARD) {
    const { count: max } = getInstallments(total)
    if (!Number.isInteger(installments) || installments < 1 || installments > max) {
      errors.installments = `Escolha de 1 a ${max} parcelas.`
    }
  }

  return errors
}
