import { OutOfStockError } from '../../domain/entities/Order.js'

const money = (decimal) => decimal.toNumber()
const ITEMS = { items: { orderBy: { id: 'asc' } } }

// Linhas do banco (pedido + itens) → pedido no formato da API
function toOrder(row) {
  return {
    id: row.id,
    number: row.number,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    customer: { name: row.customerName, email: row.customerEmail, phone: row.customerPhone },
    address: {
      cep: row.cep,
      street: row.street,
      number: row.addressNumber,
      complement: row.complement,
      neighborhood: row.neighborhood,
      city: row.city,
      state: row.state,
    },
    couponCode: row.couponCode,
    payment: {
      method: row.paymentMethod,
      installments: row.installments,
      installmentValue: money(row.installmentValue),
    },
    delivery: { minDays: row.deliveryMinDays, maxDays: row.deliveryMaxDays },
    totals: {
      subtotal: money(row.subtotal),
      discount: money(row.discount),
      pixDiscount: money(row.pixDiscount),
      shipping: money(row.shipping),
      total: money(row.total),
    },
    items: row.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      unitPrice: money(item.unitPrice),
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      lineTotal: money(item.lineTotal),
    })),
  }
}

/** Pedidos guardados no PostgreSQL (tabelas orders e order_items). */
export class PrismaOrderRepository {
  #prisma

  constructor(prisma) {
    this.#prisma = prisma
  }

  /**
   * Grava o pedido e baixa o estoque numa transação só: ou acontece tudo, ou nada.
   * A baixa só passa se ainda houver estoque (stock >= quantidade) — dois clientes não levam a mesma última unidade.
   */
  async create(order) {
    const quantityByProduct = new Map()
    for (const item of order.items) {
      quantityByProduct.set(item.productId, (quantityByProduct.get(item.productId) ?? 0) + item.quantity)
    }

    return this.#prisma.$transaction(async (tx) => {
      for (const [productId, quantity] of quantityByProduct) {
        const { count } = await tx.product.updateMany({
          where: { id: productId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        })
        if (count === 0) throw new OutOfStockError(productId)
      }

      const { customer, address, payment, totals, delivery } = order
      const row = await tx.order.create({
        data: {
          status: order.status,
          customerId: order.customerId,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          cep: address.cep,
          street: address.street,
          addressNumber: address.number,
          complement: address.complement,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          paymentMethod: payment.method,
          installments: payment.installments,
          installmentValue: payment.installmentValue,
          couponCode: order.couponCode,
          subtotal: totals.subtotal,
          discount: totals.discount,
          pixDiscount: totals.pixDiscount,
          shipping: totals.shipping,
          total: totals.total,
          deliveryMinDays: delivery.minDays,
          deliveryMaxDays: delivery.maxDays,
          items: { create: order.items.map((item) => ({ ...item })) },
        },
        include: ITEMS,
      })

      return toOrder(row)
    })
  }

  /** Pedidos de uma conta, dos mais recentes para os mais antigos. */
  async findByCustomer(customerId) {
    const rows = await this.#prisma.order.findMany({
      where: { customerId },
      orderBy: { number: 'desc' },
      include: ITEMS,
    })
    return rows.map(toOrder)
  }
}
