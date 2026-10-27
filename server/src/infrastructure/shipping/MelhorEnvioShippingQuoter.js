import { packageFor } from '../../domain/services/packages.js'
import { POSTING_DAYS } from '../../domain/services/shipping.js'

const BASE_URLS = {
  production: 'https://melhorenvio.com.br',
  sandbox: 'https://sandbox.melhorenvio.com.br',
}

/**
 * Cota o frete nas transportadoras pelo Melhor Envio (Correios, Jadlog...), usado na hospedagem.
 * Mesmo método do TableShippingQuoter (quote).
 * - `token`: a variável MELHOR_ENVIO_TOKEN (painel do Melhor Envio → Integrações → Permissões de acesso). Fica só no servidor.
 * - `fromCep`: CEP de onde a loja posta os pacotes.
 * - `sandbox`: true usa o ambiente de testes do Melhor Envio (conta e token próprios de lá).
 * - `contactEmail`: o Melhor Envio pede um e-mail de contato no User-Agent de cada chamada.
 * - `fetch`: substituível nos testes.
 */
export class MelhorEnvioShippingQuoter {
  #token
  #fromCep
  #baseUrl
  #userAgent
  #fetch

  constructor({ token, fromCep, sandbox = false, contactEmail, fetch = globalThis.fetch }) {
    if (!token) throw new Error('MELHOR_ENVIO_TOKEN não definido')
    if (!/^\d{8}$/.test(fromCep ?? '')) throw new Error('STORE_CEP inválido: use os 8 números do CEP de postagem')
    this.#token = token
    this.#fromCep = fromCep
    this.#baseUrl = sandbox ? BASE_URLS.sandbox : BASE_URLS.production
    this.#userAgent = `Montreal Moda e Casa (${contactEmail})`
    this.#fetch = fetch
  }

  /** `items`: [{ product, quantity }]. Devolve as opções com preço e prazo (sem o frete grátis da loja). */
  async quote({ cep, items }) {
    const response = await this.#fetch(`${this.#baseUrl}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.#token}`,
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': this.#userAgent,
      },
      body: JSON.stringify({
        from: { postal_code: this.#fromCep },
        to: { postal_code: cep },
        // O Melhor Envio monta as caixas a partir dos produtos; o valor declarado entra no seguro
        products: items.map(({ product, quantity }) => ({
          id: product.id,
          ...packageFor(product),
          insurance_value: product.price,
          quantity,
        })),
        options: { receipt: false, own_hand: false },
      }),
      signal: AbortSignal.timeout(15_000),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok || !Array.isArray(data)) {
      throw new Error(`Melhor Envio recusou a cotação (${response.status}): ${data?.message ?? 'sem detalhes'}`)
    }

    // Serviços que não atendem o CEP ou o tamanho do pacote vêm com `error`
    return data
      .filter((service) => !service.error)
      .map((service) => {
        const range = service.custom_delivery_range ?? service.delivery_range
        return {
          id: String(service.id),
          name: service.name,
          company: service.company?.name ?? '',
          price: Number(service.custom_price ?? service.price),
          minDays: range.min,
          maxDays: range.max + POSTING_DAYS,
        }
      })
  }
}
