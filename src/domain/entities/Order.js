import { PAYMENT_METHODS, getInstallments, getPixPrice } from '../services/payment.js'
import { createAddress } from './Address.js'
import { calculateTotals } from './Cart.js'
import { roundMoney } from './Coupon.js'
import { createCustomer } from './Customer.js'

/**
 * Valores do pedido: os mesmos da sacola + 5% de desconto no Pix (sobre os produtos, já com o cupom).
 * `payment` pode ser null enquanto o cliente ainda não escolheu como pagar.
 */
export function calculateOrderTotals(items, coupon = null, payment = null) {
  const totals = calculateTotals(items, coupon)

  const productsValue = roundMoney(totals.subtotal - totals.discount)
  const pixDiscount =
    payment?.method === PAYMENT_METHODS.PIX ? roundMoney(productsValue - getPixPrice(productsValue)) : 0
  const total = roundMoney(totals.total - pixDiscount)

  const { count: installments, value: installmentValue } = getInstallments(total)

  return { ...totals, pixDiscount, total, installments, installmentValue }
}

/**
 * Pedido finalizado: o que foi comprado, por quem, para onde, como foi pago e quanto custou.
 * `delivery` é o prazo estimado ({ minDays, maxDays }, ver estimateShipping).
 */
export function createOrder({ id, createdAt, items, coupon = null, customer, address, payment, delivery }) {
  if (!id || !createdAt || items.length === 0 || !delivery) {
    throw new Error('Pedido inválido: id, data, itens e prazo de entrega são obrigatórios')
  }

  const totals = calculateOrderTotals(items, coupon, payment)
  const installments = payment.method === PAYMENT_METHODS.CREDIT_CARD ? payment.installments : 1

  return Object.freeze({
    id,
    createdAt,
    items,
    coupon,
    customer: createCustomer(customer),
    address: createAddress(address),
    payment: Object.freeze({
      method: payment.method,
      installments,
      installmentValue: roundMoney(totals.total / installments),
    }),
    delivery: Object.freeze({ minDays: delivery.minDays, maxDays: delivery.maxDays }),
    totals: Object.freeze(totals),
  })
}
