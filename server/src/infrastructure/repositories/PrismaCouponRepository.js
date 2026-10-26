import { createCoupon } from '../../domain/entities/Coupon.js'

/** Cupons guardados no PostgreSQL (tabela coupons). */
export class PrismaCouponRepository {
  #prisma

  constructor(prisma) {
    this.#prisma = prisma
  }

  /** Só cupons ativos; o código é guardado em maiúsculas. */
  async findActiveByCode(code) {
    const row = await this.#prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } })
    if (!row?.active) return null

    return createCoupon({
      ...row,
      value: row.value.toNumber(),
      minSubtotal: row.minSubtotal.toNumber(),
    })
  }
}
