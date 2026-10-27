// Dados públicos da conta: o hash da senha nunca sai deste arquivo, exceto em findCredentialsByEmail
const PUBLIC_FIELDS = { id: true, name: true, email: true, phone: true, isAdmin: true, createdAt: true }

const toCustomer = (row) => ({ ...row, createdAt: row.createdAt.toISOString() })

/** Contas de cliente guardadas no PostgreSQL (tabela customers). */
export class PrismaCustomerRepository {
  #prisma

  constructor(prisma) {
    this.#prisma = prisma
  }

  async emailExists(email) {
    return (await this.#prisma.customer.count({ where: { email } })) > 0
  }

  /** Para o login: a conta + o hash da senha, ou null. */
  async findCredentialsByEmail(email) {
    const row = await this.#prisma.customer.findUnique({
      where: { email },
      select: { ...PUBLIC_FIELDS, passwordHash: true },
    })
    if (!row) return null
    const { passwordHash, ...customer } = row
    return { customer: toCustomer(customer), passwordHash }
  }

  async create({ name, email, phone = '', passwordHash }) {
    const row = await this.#prisma.customer.create({
      data: { name, email, phone, passwordHash },
      select: PUBLIC_FIELDS,
    })
    return toCustomer(row)
  }

  async update(id, { name, phone }) {
    const row = await this.#prisma.customer.update({ where: { id }, data: { name, phone }, select: PUBLIC_FIELDS })
    return toCustomer(row)
  }

  /** Libera ou tira o acesso ao painel. Retorna a conta, ou null se o e-mail não tem conta. */
  async setAdminByEmail(email, isAdmin) {
    const { count } = await this.#prisma.customer.updateMany({ where: { email }, data: { isAdmin } })
    if (count === 0) return null
    return toCustomer(await this.#prisma.customer.findUnique({ where: { email }, select: PUBLIC_FIELDS }))
  }
}
