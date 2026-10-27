import { createCoupon } from '../../domain/entities/Coupon.js'

const toCoupon = (row) => createCoupon({ ...row, value: row.value.toNumber(), minSubtotal: row.minSubtotal.toNumber() })

// Painel: o cupom + se está ativo, quando foi criado e em quantos pedidos foi usado
const WITH_USAGE = { _count: { select: { orders: true } } }
const toAdminCoupon = (row) => ({
  ...toCoupon(row),
  active: row.active,
  createdAt: row.createdAt.toISOString(),
  timesUsed: row._count.orders,
})

/** Cupons guardados no PostgreSQL (tabela coupons). */
export class PrismaCouponRepository {
  #prisma

  constructor(prisma) {
    this.#prisma = prisma
  }

  /** Só cupons ativos; o código é guardado em maiúsculas. */
  async findActiveByCode(code) {
    const row = await this.#prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } })
    return row?.active ? toCoupon(row) : null
  }

  /** Painel: todos os cupons, ativos ou não, dos mais novos para os mais antigos. */
  async findAll() {
    const rows = await this.#prisma.coupon.findMany({ orderBy: { createdAt: 'desc' }, include: WITH_USAGE })
    return rows.map(toAdminCoupon)
  }

  async exists(code) {
    return (await this.#prisma.coupon.count({ where: { code } })) > 0
  }

  async create({ code, type, value, minSubtotal, description }) {
    const row = await this.#prisma.coupon.create({
      data: { code, type, value, minSubtotal, description },
      include: WITH_USAGE,
    })
    return toAdminCoupon(row)
  }

  /** Liga ou desliga o cupom (não apaga: pedidos antigos apontam para ele). null se não existe. */
  async setActive(code, active) {
    const { count } = await this.#prisma.coupon.updateMany({ where: { code }, data: { active } })
    if (count === 0) return null
    return toAdminCoupon(await this.#prisma.coupon.findUnique({ where: { code }, include: WITH_USAGE }))
  }
}
