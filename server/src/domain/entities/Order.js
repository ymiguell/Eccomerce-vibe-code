import { PAYMENT_METHODS, getInstallments, getPixPrice } from '../services/payment.js'
import { createAddress } from './Address.js'
import { calculateTotals, getLineTotal } from './Cart.js'
import { roundMoney } from './Coupon.js'
import { createCustomer } from './Customer.js'

export const ORDER_STATUSES = Object.freeze(['pending_payment', 'paid', 'shipped', 'delivered', 'canceled'])

/**
 * Para qual situação cada pedido pode ir. Entregue e cancelado são finais;
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

// Letras, números e hífen. Correios: AA123456789BR; outras transportadoras usam outros formatos
const TRACKING_CODE_PATTERN = /^[A-Z0-9-]{4,40}$/

/** " aa 123456789 br " → "AA123456789BR" */
export function normalizeTrackingCode(value) {
  return value.replace(/\s/g, '').toUpperCase()
}

export function isValidTrackingCode(code) {
  return TRACKING_CODE_PATTERN.test(code)
}

/** O produto esgotou (ou não tem a quantidade pedida) no momento de gravar o pedido. */
export class OutOfStockError extends Error {
  constructor(productId) {
    super(`Estoque insuficiente: ${productId}`)
    this.name = 'OutOfStockError'
    this.productId = productId
  }
}

/** Valores do pedido: os da sacola + 5% de desconto no Pix (sobre os produtos, já com o cupom). */
export function calculateOrderTotals(items, coupon = null, payment = null, shipping = 0) {
  const totals = calculateTotals(items, coupon, shipping)

  const productsValue = roundMoney(totals.subtotal - totals.discount)
  const pixDiscount =
    payment?.method === PAYMENT_METHODS.PIX ? roundMoney(productsValue - getPixPrice(productsValue)) : 0
  const total = roundMoney(totals.total - pixDiscount)

  const { count: installments, value: installmentValue } = getInstallments(total)

  return { ...totals, pixDiscount, total, installments, installmentValue }
}

/**
 * Monta o pedido pronto para gravar (o número e a data vêm do banco).
 * Cada item guarda nome, foto e preço do momento da compra: se o produto mudar depois, o pedido não muda.
 * `shipping` é a opção de frete escolhida (ver applyFreeShipping): dá o valor do frete, o prazo e o serviço.
 */
export function buildOrder({ customerId = null, items, coupon = null, customer, address, payment, shipping }) {
  if (items.length === 0) throw new Error('Pedido sem itens')

  const totals = calculateOrderTotals(items, coupon, payment, shipping.price)
  const installments = payment.method === PAYMENT_METHODS.CREDIT_CARD ? payment.installments : 1

  return Object.freeze({
    status: 'pending_payment',
    customerId,
    customer: createCustomer(customer),
    address: createAddress(address),
    couponCode: coupon?.code ?? null,
    payment: Object.freeze({
      method: payment.method,
      installments,
      installmentValue: roundMoney(totals.total / installments),
    }),
    delivery: Object.freeze({
      minDays: shipping.minDays,
      maxDays: shipping.maxDays,
      // Ex.: "Correios PAC": a equipe compra a etiqueta deste serviço
      service: [shipping.company, shipping.name].filter(Boolean).join(' '),
    }),
    totals: Object.freeze(totals),
    items: items.map((item) =>
      Object.freeze({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image,
        unitPrice: item.product.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        lineTotal: getLineTotal(item),
      }),
    ),
  })
}
