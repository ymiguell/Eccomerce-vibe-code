// Guarda os e-mails só em memória e simula a demora de uma API. Depois vira uma chamada real.
const NETWORK_DELAY_MS = 600

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export class MockNewsletterRepository {
  #emails = new Set()

  async exists(email) {
    return this.#emails.has(email)
  }

  async save(email) {
    await wait(NETWORK_DELAY_MS)
    this.#emails.add(email)
  }
}
