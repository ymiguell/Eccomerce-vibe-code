import { createProduct } from '../../domain/entities/Product.js'

// Linha do banco → entidade do domínio. Os valores em dinheiro chegam como Decimal e viram número.
function toProduct(row) {
  return createProduct({
    ...row,
    price: row.price.toNumber(),
    originalPrice: row.originalPrice?.toNumber() ?? null,
  })
}

const ORDER = [{ position: 'asc' }, { name: 'asc' }]

/** Produtos guardados no PostgreSQL (tabela products). */
export class PrismaProductRepository {
  #prisma

  constructor(prisma) {
    this.#prisma = prisma
  }

  async findMany({ niche = null, featured = false, onSale = false } = {}) {
    const rows = await this.#prisma.product.findMany({
      where: {
        ...(niche && { niche }),
        ...(featured && { isFeatured: true }),
        // Em promoção = tem preço original (a entidade garante que ele é maior que o preço)
        ...(onSale && { originalPrice: { not: null } }),
      },
      orderBy: ORDER,
    })
    return rows.map(toProduct)
  }

  async findById(id) {
    const row = await this.#prisma.product.findUnique({ where: { id } })
    return row ? toProduct(row) : null
  }

  async findByIds(ids) {
    const rows = await this.#prisma.product.findMany({ where: { id: { in: ids } } })
    return rows.map(toProduct)
  }

  /** Painel: preço, promoção, estoque e destaque. */
  async update(id, { price, originalPrice, stock, isFeatured }) {
    const row = await this.#prisma.product.update({ where: { id }, data: { price, originalPrice, stock, isFeatured } })
    return toProduct(row)
  }
}
