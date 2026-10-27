/** Inscritos na newsletter guardados no PostgreSQL (tabela newsletter_subscribers). */
export class PrismaNewsletterRepository {
  #prisma

  constructor(prisma) {
    this.#prisma = prisma
  }

  /**
   * Inscreve o e-mail. Retorna false se ele já estava inscrito.
   * `skipDuplicates` deixa o próprio banco recusar o repetido: dois envios ao mesmo tempo não viram erro.
   */
  async add(email) {
    const { count } = await this.#prisma.newsletterSubscriber.createMany({ data: [{ email }], skipDuplicates: true })
    return count === 1
  }

  /** Painel: todos os inscritos, dos mais recentes para os mais antigos. */
  async findAll() {
    const rows = await this.#prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } })
    return rows.map((row) => ({ email: row.email, createdAt: row.createdAt.toISOString() }))
  }

  /** Tira o e-mail da lista (pedido do próprio cliente). Retorna false se ele não estava inscrito. */
  async remove(email) {
    const { count } = await this.#prisma.newsletterSubscriber.deleteMany({ where: { email } })
    return count === 1
  }
}
