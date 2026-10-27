/**
 * Envia os e-mails da loja pelo Brevo (serviço de e-mail), usado na hospedagem. Mesmo método do ConsoleEmailSender (send).
 * - `apiKey`: a variável BREVO_API_KEY (painel do Brevo → SMTP & API → API Keys). Fica só no servidor.
 * - `sender`: { email, name } de quem envia; o e-mail precisa estar verificado no Brevo.
 * - `fetch`: substituível nos testes.
 */
export class BrevoEmailSender {
  #apiKey
  #sender
  #fetch

  constructor({ apiKey, sender, fetch = globalThis.fetch }) {
    if (!apiKey) throw new Error('BREVO_API_KEY não definida')
    if (!sender?.email) throw new Error('E-mail de quem envia não definido (EMAIL_FROM)')
    this.#apiKey = apiKey
    this.#sender = sender
    this.#fetch = fetch
  }

  async send({ to, subject, text }) {
    const response = await this.#fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': this.#apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ sender: this.#sender, to: [{ email: to }], subject, textContent: text }),
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(`Brevo recusou o e-mail (${response.status}): ${data.message ?? 'sem detalhes'}`)
    }
  }
}
