import { validateAddress } from '../../domain/entities/Address.js'
import { InvalidItemError, createCartItem, mergeItems } from '../../domain/entities/Cart.js'
import { isCouponApplicable } from '../../domain/entities/Coupon.js'
import { validateCustomer } from '../../domain/entities/Customer.js'
import { OutOfStockError, buildOrder, calculateOrderTotals } from '../../domain/entities/Order.js'
import { validatePayment } from '../../domain/services/payment.js'
import { quoteOptions } from './quoteShipping.js'

// Diferença aceitável entre o total que o cliente viu e o recalculado (arredondamento de centavos)
const TOTAL_TOLERANCE = 0.01

const hasErrors = (errors) => Object.keys(errors).length > 0

/**
 * Caso de uso: finalizar a compra. Quem decide os valores é o servidor:
 * o navegador manda só produtos, variações, quantidades, cupom, dados de entrega e forma de pagamento;
 * preços, desconto, frete e total são recalculados aqui com os dados do banco.
 * `shippingOptionId` é a opção de frete escolhida: o frete é cotado de novo aqui e vale o preço de agora.
 * `expectedTotal` é o total que o cliente viu: se não bater (ex.: o preço mudou), o pedido não é gravado.
 * `customerId`: conta de quem está logado (null em compra sem login), para o pedido aparecer em "Minha conta".
 *
 * Retorna { order } ou { error, ...detalhes }:
 * empty_cart · invalid_data { fields } · product_not_found { productId } · invalid_item { productId, message }
 * out_of_stock { productId } · invalid_coupon · coupon_min_subtotal { minSubtotal } · price_changed { total }
 * shipping_unavailable · shipping_option_not_found (a opção escolhida não existe mais: cotar de novo)
 */
export function makePlaceOrder({ productRepository, couponRepository, orderRepository, shippingQuoter }) {
  return async function placeOrder({
    items: lines,
    couponCode = null,
    customer,
    address,
    payment,
    shippingOptionId,
    expectedTotal,
    customerId = null,
  }) {
    if (lines.length === 0) return { error: 'empty_cart' }

    const fields = { ...validateCustomer(customer), ...validateAddress(address) }
    if (hasErrors(fields)) return { error: 'invalid_data', fields }

    // Produtos do banco (com o preço e o estoque de agora)
    const products = await productRepository.findByIds([...new Set(lines.map((line) => line.productId))])
    const productById = new Map(products.map((product) => [product.id, product]))

    let items
    try {
      const created = []
      for (const line of lines) {
        const product = productById.get(line.productId)
        if (!product) return { error: 'product_not_found', productId: line.productId }
        created.push(createCartItem(product, line))
      }
      items = mergeItems(created)
    } catch (error) {
      if (error instanceof InvalidItemError) return { error: 'invalid_item', productId: error.productId, message: error.message }
      throw error
    }

    // O estoque é do produto (somando todas as variações pedidas)
    const quantityByProduct = new Map()
    for (const item of items) {
      quantityByProduct.set(item.product.id, (quantityByProduct.get(item.product.id) ?? 0) + item.quantity)
    }
    for (const [productId, quantity] of quantityByProduct) {
      if (quantity > productById.get(productId).stock) return { error: 'out_of_stock', productId }
    }

    let coupon = null
    if (couponCode) {
      coupon = await couponRepository.findActiveByCode(couponCode)
      if (!coupon) return { error: 'invalid_coupon' }
    }

    const quote = await quoteOptions(shippingQuoter, address.cep, items)
    if (quote.error) return quote
    const shipping = quote.options.find((option) => option.id === shippingOptionId)
    if (!shipping) return { error: 'shipping_option_not_found' }

    const totals = calculateOrderTotals(items, coupon, payment, shipping.price)
    if (coupon && !isCouponApplicable(coupon, totals.subtotal)) {
      return { error: 'coupon_min_subtotal', minSubtotal: coupon.minSubtotal }
    }

    const paymentErrors = validatePayment(payment, totals.total)
    if (hasErrors(paymentErrors)) return { error: 'invalid_data', fields: paymentErrors }

    if (Math.abs(totals.total - expectedTotal) > TOTAL_TOLERANCE) return { error: 'price_changed', total: totals.total }

    const order = buildOrder({
      customerId,
      items,
      coupon,
      customer,
      address,
      payment,
      shipping,
    })

    try {
      // Grava o pedido e baixa o estoque juntos: se outro cliente levou a última unidade, nada é gravado
      return { order: await orderRepository.create(order) }
    } catch (error) {
      if (error instanceof OutOfStockError) return { error: 'out_of_stock', productId: error.productId }
      throw error
    }
  }
}
