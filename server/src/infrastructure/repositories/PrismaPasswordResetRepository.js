import { generateSessionToken, hashSessionToken } from '../security/sessionTokens.js'

// Quanto tempo o link de "esqueci minha senha" vale
const RESET_MINUTES = 60
const MINUTE_MS = 60 * 1000

/** Links de redefinição de senha (tabela password_resets). O token só existe no e-mail; aqui fica o hash dele. */
export class PrismaPasswordResetRepository {
  #prisma

  constructor(prisma) {
    this.#prisma = prisma
  }

  /** Cria um link novo e devolve o token. Links anteriores da mesma conta deixam de valer. */
  async create(customerId) {
    const token = generateSessionToken()
    await this.#prisma.$transaction([
      this.#prisma.passwordReset.deleteMany({ where: { customerId } }),
      this.#prisma.passwordReset.create({
        data: { tokenHash: hashSessionToken(token), customerId, expiresAt: new Date(Date.now() + RESET_MINUTES * MINUTE_MS) },
      }),
    ])
    return token
  }

  /**
   * Usa o link: devolve a conta dona do token e apaga o link (vale uma vez só).
   * null se o token não existe, venceu ou já foi usado (inclusive por outra aba ao mesmo tempo).
   */
  async consume(token) {
    const tokenHash = hashSessionToken(token)
    const reset = await this.#prisma.passwordReset.findUnique({ where: { tokenHash }, select: { customerId: true, expiresAt: true } })
    if (!reset || reset.expiresAt <= new Date()) return null

    const { count } = await this.#prisma.passwordReset.deleteMany({ where: { tokenHash } })
    return count === 1 ? reset.customerId : null
  }
}
