import { createHash } from 'node:crypto'

// Pasta das fotos dos produtos dentro da conta do Cloudinary
const FOLDER = 'montreal/produtos'

/**
 * Guarda as fotos enviadas pelo painel no Cloudinary (serviço de imagens), usado na hospedagem:
 * lá os arquivos do próprio servidor somem a cada deploy. Mesmos métodos do LocalImageStorage (save e isStored).
 * - `cloudinaryUrl`: a variável CLOUDINARY_URL do painel do Cloudinary, no formato
 *   cloudinary://<api_key>:<api_secret>@<cloud_name>. Ela fica só no servidor (nunca no site nem no Git).
 * - `fetch`: substituível nos testes.
 */
export class CloudinaryImageStorage {
  #cloudName
  #apiKey
  #apiSecret
  #fetch

  constructor({ cloudinaryUrl, fetch = globalThis.fetch }) {
    const url = new URL(cloudinaryUrl)
    if (url.protocol !== 'cloudinary:' || !url.username || !url.password || !url.hostname) {
      throw new Error('CLOUDINARY_URL inválida: use o formato cloudinary://<api_key>:<api_secret>@<cloud_name>')
    }
    this.#apiKey = decodeURIComponent(url.username)
    this.#apiSecret = decodeURIComponent(url.password)
    this.#cloudName = url.hostname
    this.#fetch = fetch
  }

  /** Envia a imagem (o Cloudinary dá um nome aleatório) e devolve o endereço https dela. */
  async save(bytes, extension) {
    // Envio assinado: só quem tem o segredo da conta consegue gravar
    const params = { folder: FOLDER, timestamp: String(Math.floor(Date.now() / 1000)) }
    const toSign = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&')
    const signature = createHash('sha1').update(toSign + this.#apiSecret).digest('hex')

    const form = new FormData()
    form.append('file', new Blob([bytes], { type: `image/${extension === 'jpg' ? 'jpeg' : extension}` }))
    for (const [key, value] of Object.entries(params)) form.append(key, value)
    form.append('api_key', this.#apiKey)
    form.append('signature', signature)

    const response = await this.#fetch(`https://api.cloudinary.com/v1_1/${this.#cloudName}/image/upload`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(30_000),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.secure_url) {
      throw new Error(`Cloudinary recusou o envio (${response.status}): ${data.error?.message ?? 'sem detalhes'}`)
    }
    return data.secure_url
  }

  /** true se o endereço é de uma foto guardada na pasta da loja nesta conta (o painel não aceita foto de outro site). */
  isStored(url) {
    if (typeof url !== 'string') return false
    const prefix = `https://res.cloudinary.com/${this.#cloudName}/image/upload/`
    return url.startsWith(prefix) && new RegExp(`^(v\\d+/)?${FOLDER}/[\\w-]+\\.(jpg|png|webp)$`).test(url.slice(prefix.length))
  }
}
