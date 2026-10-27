import { createReview } from '../../domain/entities/Review.js'

// Linha do banco → avaliação do domínio (a data vira AAAA-MM-DD)
const toReview = (row) => createReview({ ...row, date: row.createdAt.toISOString().slice(0, 10) })

// Painel: a avaliação + se está oculta e o nome do produto
const WITH_PRODUCT = { product: { select: { name: true } } }
const toAdminReview = (row) => ({ ...toReview(row), hidden: row.hidden, productName: row.product.name })

/** Avaliações guardadas no PostgreSQL (tabela reviews). */
export class PrismaReviewRepository {
  #prisma

  constructor(prisma) {
    this.#prisma = prisma
  }

  /** Loja: só as avaliações visíveis (as ocultadas pela equipe não aparecem nem contam na nota). */
  async findByProduct(productId) {
    const rows = await this.#prisma.review.findMany({
      where: { productId, hidden: false },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toReview)
  }

  async create({ productId, author, rating, comment }) {
    return toReview(await this.#prisma.review.create({ data: { productId, author, rating, comment } }))
  }

  /** Painel: uma página de avaliações de todos os produtos, mais recentes primeiro. `hidden`: null = todas. */
  async findPage({ hidden = null, page, pageSize }) {
    const where = hidden === null ? {} : { hidden }
    const [rows, total] = await this.#prisma.$transaction([
      this.#prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: WITH_PRODUCT,
      }),
      this.#prisma.review.count({ where }),
    ])
    return { reviews: rows.map(toAdminReview), total }
  }

  /** Quantas visíveis e quantas ocultas, ex.: { visible: 350, hidden: 3 } */
  async countByVisibility() {
    const [visible, hidden] = await this.#prisma.$transaction([
      this.#prisma.review.count({ where: { hidden: false } }),
      this.#prisma.review.count({ where: { hidden: true } }),
    ])
    return { visible, hidden }
  }

  /** Oculta ou mostra de novo. null se a avaliação não existe. */
  async setHidden(id, hidden) {
    const { count } = await this.#prisma.review.updateMany({ where: { id }, data: { hidden } })
    if (count === 0) return null
    return toAdminReview(await this.#prisma.review.findUnique({ where: { id }, include: WITH_PRODUCT }))
  }
}
