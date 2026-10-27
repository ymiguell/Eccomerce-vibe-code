import { getInstallments } from '../services/payment.js'
import { getCouponDiscount, roundMoney } from './Coupon.js'

/*
 * Itens de um pedido e o cálculo dos valores. Mesmas regras da sacola do front (src/domain/entities/Cart.js),
 * mas aqui os preços vêm do banco: é este cálculo que vale na hora de gravar o pedido.
 */
export const MAX_QUANTITY = 10

export class InvalidItemError extends Error {
  constructor(productId, message) {
    super(message)
    this.name = 'InvalidItemError'
    this.productId = productId
  }
}

/**
 * Tamanho: obrigatório quando o produto tem tamanhos.
 * Cor: obrigatória quando há mais de uma; com uma só, ela é preenchida sozinha.
 */
function resolveOptions(product, { size = null, color = null }) {
  const needsSize = product.sizes.length > 0
  const needsColor = product.colors.length > 1
  const resolvedColor = color ?? (product.colors.length === 1 ? product.colors[0] : null)

  if (needsSize && !product.sizes.includes(size)) {
    throw new InvalidItemError(product.id, `Tamanho inválido para ${product.name}`)
  }
  if (needsColor && !product.colors.includes(resolvedColor)) {
    throw new InvalidItemError(product.id, `Cor inválida para ${product.name}`)
  }

  return { size: needsSize ? size : null, color: resolvedColor }
}

/** Linha do pedido: produto + variação + quantidade, validados contra o produto do banco. */
export function createCartItem(product, { size = null, color = null, quantity }) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new InvalidItemError(product.id, `Quantidade deve ser de 1 a ${MAX_QUANTITY} (${product.name})`)
  }

  return Object.freeze({ product, quantity, ...resolveOptions(product, { size, color }) })
}

const itemKey = (item) => [item.product.id, item.size ?? '', item.color ?? ''].join('|')

/** Junta linhas repetidas (mesmo produto, tamanho e cor) somando as quantidades. */
export function mergeItems(items) {
  const merged = new Map()
  for (const item of items) {
    const key = itemKey(item)
    const current = merged.get(key)
    merged.set(key, current ? createCartItem(item.product, { ...item, quantity: current.quantity + item.quantity }) : item)
  }
  return [...merged.values()]
}

export function getLineTotal(item) {
  return roundMoney(item.product.price * item.quantity)
}

export function calculateSubtotal(items) {
  return roundMoney(items.reduce((sum, item) => sum + getLineTotal(item), 0))
}

/**
 * Subtotal, desconto do cupom, frete e total (sem o desconto do Pix, ver calculateOrderTotals).
 * `shipping` é o preço da opção de frete escolhida (já com o frete grátis aplicado, ver applyFreeShipping).
 */
export function calculateTotals(items, coupon = null, shipping = 0) {
  const subtotal = calculateSubtotal(items)
  const discount = getCouponDiscount(coupon, subtotal)
  const total = roundMoney(subtotal - discount + shipping)
  const { count: installments, value: installmentValue } = getInstallments(total)

  return { subtotal, discount, shipping, total, installments, installmentValue }
}
