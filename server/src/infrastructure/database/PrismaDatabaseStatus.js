/** Confere se o banco responde, com a consulta mais leve possível. */
export class PrismaDatabaseStatus {
  #prisma

  constructor(prisma) {
    this.#prisma = prisma
  }

  async ping() {
    await this.#prisma.$queryRaw`SELECT 1`
  }
}
