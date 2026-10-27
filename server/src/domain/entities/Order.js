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

/** O produto esgotou (ou não tem a quantidade pedida) no momento de gravar o pedido. */
export class OutOfStockError extends Error {
  constructor(productId) {
    super(`Estoque insuficiente: ${productId}`)
    this.name = 'OutOfStockError'
    this.productId = productId
  }
}

/** Valores do pedido: os da sacola + 5% de desconto no Pix (sobre os produtos, já com o cupom). */
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
 * Monta o pedido pronto para gravar (o número e a data vêm do banco).
 * Cada item guarda nome, foto e preço do momento da compra: se o produto mudar depois, o pedido não muda.
 */
export function buildOrder({ customerId = null, items, coupon = null, customer, address, payment, delivery }) {
  if (items.length === 0) throw new Error('Pedido sem itens')

  const totals = calculateOrderTotals(items, coupon, payment)
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
    delivery: Object.freeze({ minDays: delivery.minDays, maxDays: delivery.maxDays }),
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
