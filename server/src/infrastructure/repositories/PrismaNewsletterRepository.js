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
}
