import { getInstallments } from '../services/payment.js'
import { FREE_SHIPPING_THRESHOLD, hasFreeShipping } from '../services/shipping.js'
import { getCouponDiscount, roundMoney } from './Coupon.js'
import { isInStock } from './Product.js'

// Regras de negócio do carrinho (frete e parcelamento ficam nos serviços de domínio)
export const MAX_QUANTITY = 10
export { FREE_SHIPPING_THRESHOLD }

/**
 * Item da sacola: um produto + a variação escolhida (tamanho/cor) + quantidade.
 * O mesmo produto em tamanhos ou cores diferentes vira itens separados.
 */
export function createCartItem({ product, quantity = 1, size = null, color = null }) {
  if (!product) throw new Error('Item do carrinho inválido: product é obrigatório')

  return Object.freeze({ product, size, color, quantity: clampQuantity(quantity) })
}

function clampQuantity(quantity) {
  return Math.min(Math.max(quantity, 1), MAX_QUANTITY)
}

/** O que basta guardar para remontar a linha depois: preço, foto etc. sempre vêm do catálogo atualizado. */
export function toCartEntry(item) {
  return { productId: item.product.id, size: item.size, color: item.color, quantity: item.quantity }
}

/** Identifica a linha da sacola: produto + tamanho + cor. */
export function getItemKey(item) {
  return [item.product.id, item.size ?? '', item.color ?? ''].join('|')
}

/**
 * Quais opções o cliente precisa escolher antes de comprar.
 * Tamanho: sempre que o produto tiver tamanhos. Cor: só se houver mais de uma (com uma só, ela é automática).
 */
export function getRequiredOptions(product) {
  return { size: product.sizes.length > 0, color: product.colors.length > 1 }
}

/** O que ainda falta escolher, ex.: ['size', 'color']. Lista vazia = pode ir para a sacola. */
export function getMissingOptions(product, { size = null, color = null }) {
  const required = getRequiredOptions(product)
  return [required.size && !size && 'size', required.color && !color && 'color'].filter(Boolean)
}

export function needsOptionSelection(product) {
  const required = getRequiredOptions(product)
  return required.size || required.color
}

/** Confere se a escolha é válida para o produto; com cor única, preenche a cor sozinho. */
function resolveOptions(product, { size = null, color = null }) {
  const required = getRequiredOptions(product)
  const resolvedColor = color ?? (product.colors.length === 1 ? product.colors[0] : null)

  if (required.size && !product.sizes.includes(size)) {
    throw new Error(`Escolha um tamanho válido para ${product.name}`)
  }
  if (required.color && !product.colors.includes(resolvedColor)) {
    throw new Error(`Escolha uma cor válida para ${product.name}`)
  }

  return { size: required.size ? size : null, color: resolvedColor }
}

/** Soma `delta` à quantidade da linha, respeitando o mínimo de 1 e o máximo por item. */
export function changeQuantity(items, itemKey, delta) {
  return items.map((item) =>
    getItemKey(item) === itemKey ? createCartItem({ ...item, quantity: item.quantity + delta }) : item,
  )
}

/**
 * Adiciona o produto, na variação escolhida, à sacola.
 * Se a mesma variação já estiver lá, soma à quantidade. Produto esgotado não entra.
 */
export function addItem(items, product, { size = null, color = null, quantity = 1 } = {}) {
  if (!isInStock(product)) return items

  const newItem = createCartItem({ product, quantity, ...resolveOptions(product, { size, color }) })
  const key = getItemKey(newItem)

  const alreadyInCart = items.some((item) => getItemKey(item) === key)
  if (alreadyInCart) return changeQuantity(items, key, quantity)

  return [...items, newItem]
}

export function removeItem(items, itemKey) {
  return items.filter((item) => getItemKey(item) !== itemKey)
}

export function countItems(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function getLineTotal(item) {
  return roundMoney(item.product.price * item.quantity)
}

export function calculateSubtotal(items) {
  return roundMoney(items.reduce((sum, item) => sum + getLineTotal(item), 0))
}

/**
 * Calcula todos os valores do resumo do pedido.
 * `shipping`: preço da opção de frete escolhida. Sem opção escolhida, o frete fica null ("calculado na entrega")
 * e fora do total, a não ser que a compra já tenha frete grátis.
 */
export function calculateTotals(items, coupon = null, shipping = null) {
  const subtotal = calculateSubtotal(items)
  const discount = getCouponDiscount(coupon, subtotal)

  const freeShipping = hasFreeShipping(subtotal)
  const shippingValue = items.length === 0 ? 0 : (shipping ?? (freeShipping ? 0 : null))
  const missingForFreeShipping = freeShipping ? 0 : roundMoney(FREE_SHIPPING_THRESHOLD - subtotal)

  const total = roundMoney(subtotal - discount + (shippingValue ?? 0))

  const { count: installments, value: installmentValue } = getInstallments(total)

  return { subtotal, discount, shipping: shippingValue, missingForFreeShipping, total, installments, installmentValue }
}
