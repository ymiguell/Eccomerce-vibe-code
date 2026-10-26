// No plano gratuito da hospedagem a API "dorme" e a primeira resposta pode levar quase 1 minuto
const TIMEOUT_MS = 60_000
// Respostas de leitura ficam guardadas por um tempo: várias telas pedem o mesmo catálogo
const CACHE_TTL_MS = 5 * 60_000

export class ApiError extends Error {
  /** `details`: o resto da resposta de erro (ex.: { productId } em out_of_stock, { total } em price_changed) */
  constructor(status, code, message, details = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * Cliente da API da loja (server/).
 * `get` e `post` devolvem o JSON da resposta ou lançam ApiError ({ status, code, details }) — status 0 = sem conexão.
 * Só o GET usa cache; o POST sempre vai ao servidor.
 */
export function createApiClient(baseUrl) {
  const cache = new Map() // caminho → { expiresAt, promise }

  async function request(path, { method = 'GET', body } = {}) {
    let response
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch {
      throw new ApiError(0, 'network_error', 'Não foi possível falar com o servidor.')
    }

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      const { error = 'http_error', message = `Erro ${response.status}`, ...details } = data ?? {}
      throw new ApiError(response.status, error, message, details)
    }
    return data
  }

  return {
    get(path) {
      const cached = cache.get(path)
      if (cached && cached.expiresAt > Date.now()) return cached.promise

      const promise = request(path)
      cache.set(path, { expiresAt: Date.now() + CACHE_TTL_MS, promise })
      // Erro não fica guardado: a próxima tentativa chama a API de novo
      promise.catch(() => cache.delete(path))
      return promise
    },

    post(path, body) {
      return request(path, { method: 'POST', body })
    },
  }
}
