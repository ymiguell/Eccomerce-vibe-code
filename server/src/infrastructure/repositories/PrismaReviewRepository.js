import { createReview } from '../../domain/entities/Review.js'

// Linha do banco → avaliação do domínio (a data vira AAAA-MM-DD)
const toReview = (row) => createReview({ ...row, date: row.createdAt.toISOString().slice(0, 10) })

/** Avaliações guardadas no PostgreSQL (tabela reviews). */
export class PrismaReviewRepository {
  #prisma

  constructor(prisma) {
    this.#prisma = prisma
  }

  async findByProduct(productId) {
    const rows = await this.#prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toReview)
  }

  async create({ productId, author, rating, comment }) {
    return toReview(await this.#prisma.review.create({ data: { productId, author, rating, comment } }))
  }
}
