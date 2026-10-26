// Usado quando o site roda sem a API: guarda os e-mails só em memória e simula a demora da rede.
const NETWORK_DELAY_MS = 600

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export class MockNewsletterRepository {
  #emails = new Set()

  /** Imita a API: { ok: true } ou { error: 'already_subscribed' }. */
  async subscribe(email) {
    await wait(NETWORK_DELAY_MS)
    if (this.#emails.has(email)) return { error: 'already_subscribed' }

    this.#emails.add(email)
    return { ok: true }
  }
}
