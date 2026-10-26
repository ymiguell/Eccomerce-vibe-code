import { ALL_PAGES, createBanner } from '../../domain/entities/Banner.js'

/** Banners guardados no PostgreSQL (tabela banners). */
export class PrismaBannerRepository {
  #prisma

  constructor(prisma) {
    this.#prisma = prisma
  }

  async findByPlacement(placement) {
    const rows = await this.#prisma.banner.findMany({
      where: { placement: { in: [placement, ALL_PAGES] } },
      orderBy: { position: 'asc' },
    })
    return rows.map(createBanner)
  }
}
