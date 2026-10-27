import { PAYMENT_METHODS, getInstallments, getPixPrice } from '../services/payment.js'
import { shippingServiceName } from '../services/shipping.js'
import { createAddress } from './Address.js'
import { calculateTotals } from './Cart.js'
import { roundMoney } from './Coupon.js'
import { createCustomer } from './Customer.js'

/**
 * Valores do pedido: os mesmos da sacola + 5% de desconto no Pix (sobre os produtos, já com o cupom).
 * `payment` pode ser null enquanto o cliente ainda não escolheu como pagar;
 * `shipping` é o preço do frete escolhido (null antes de escolher, ver calculateTotals).
 */
export function calculateOrderTotals(items, coupon = null, payment = null, shipping = null) {
  const totals = calculateTotals(items, coupon, shipping)

  const productsValue = roundMoney(totals.subtotal - totals.discount)
  const pixDiscount =
    payment?.method === PAYMENT_METHODS.PIX ? roundMoney(productsValue - getPixPrice(productsValue)) : 0
  const total = roundMoney(totals.total - pixDiscount)

  const { count: installments, value: installmentValue } = getInstallments(total)

  return { ...totals, pixDiscount, total, installments, installmentValue }
}

/**
 * Pedido finalizado: o que foi comprado, por quem, para onde, como foi pago e quanto custou.
 * `shipping` é a opção de frete escolhida ({ id, name, company, price, minDays, maxDays }).
 */
export function createOrder({ id, number, createdAt, items, coupon = null, customer, address, payment, shipping }) {
  if (!id || !number || !createdAt || items.length === 0 || !shipping) {
    throw new Error('Pedido inválido: id, número, data, itens e frete são obrigatórios')
  }

  const totals = calculateOrderTotals(items, coupon, payment, shipping.price)
  const installments = payment.method === PAYMENT_METHODS.CREDIT_CARD ? payment.installments : 1

  return Object.freeze({
    id,
    number,
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
    delivery: Object.freeze({ minDays: shipping.minDays, maxDays: shipping.maxDays, service: shippingServiceName(shipping) }),
    totals: Object.freeze(totals),
  })
}

export const ORDER_STATUSES = Object.freeze(['pending_payment', 'paid', 'shipped', 'delivered', 'canceled'])

/**
 * Para qual situação cada pedido pode ir (mesma regra do servidor). Entregue e cancelado são finais;
 * depois de enviado não dá mais para cancelar (aí é devolução).
 */
export const ORDER_STATUS_TRANSITIONS = Object.freeze({
  pending_payment: Object.freeze(['paid', 'canceled']),
  paid: Object.freeze(['shipped', 'canceled']),
  shipped: Object.freeze(['delivered']),
  delivered: Object.freeze([]),
  canceled: Object.freeze([]),
})

export function canChangeOrderStatus(from, to) {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false
}

/** Situações em que o pedido já saiu da loja (pode ter código de rastreio). */
export const SHIPPED_STATUSES = Object.freeze(['shipped', 'delivered'])

// Letras, números e hífen (mesma regra do servidor). Correios: AA123456789BR
const TRACKING_CODE_PATTERN = /^[A-Z0-9-]{4,40}$/

/** " aa 123456789 br " → "AA123456789BR" */
export function normalizeTrackingCode(value) {
  return value.replace(/\s/g, '').toUpperCase()
}

export function isValidTrackingCode(code) {
  return TRACKING_CODE_PATTERN.test(code)
}

/** Para formulários: { trackingCode: mensagem } se o código digitado é inválido; vazio é aceito (sem rastreio). */
export function validateTrackingCode(value) {
  const code = normalizeTrackingCode(value)
  return code && !isValidTrackingCode(code) ? { trackingCode: 'Use de 4 a 40 letras, números ou hífen.' } : {}
}
