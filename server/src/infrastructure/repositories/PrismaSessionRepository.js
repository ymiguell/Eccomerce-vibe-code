import { generateSessionToken, hashSessionToken } from '../security/sessionTokens.js'

// Quanto tempo o cliente continua logado sem precisar entrar de novo
const SESSION_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

const PUBLIC_FIELDS = { id: true, name: true, email: true, phone: true, isAdmin: true, createdAt: true }

/** Sessões de login (tabela sessions). O token só existe com o cliente; aqui fica o hash dele. */
export class PrismaSessionRepository {
  #prisma

  constructor(prisma) {
    this.#prisma = prisma
  }

  /** Abre uma sessão e devolve o token (a única vez que ele aparece no servidor). */
  async create(customerId) {
    const token = generateSessionToken()
    await this.#prisma.session.create({
      data: {
        tokenHash: hashSessionToken(token),
        customerId,
        expiresAt: new Date(Date.now() + SESSION_DAYS * DAY_MS),
      },
    })
    return token
  }

  /** Conta dona do token, ou null se o token não existe ou a sessão venceu. */
  async findCustomerByToken(token) {
    const session = await this.#prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      select: { expiresAt: true, customer: { select: PUBLIC_FIELDS } },
    })
    if (!session || session.expiresAt <= new Date()) return null
    return { ...session.customer, createdAt: session.customer.createdAt.toISOString() }
  }

  async delete(token) {
    await this.#prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } })
  }
}
