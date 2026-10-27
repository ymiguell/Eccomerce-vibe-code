import { ApiError } from '../http/apiClient.js'
import { toOrder } from './HttpOrderRepository.js'

// Erro da API → { error, fields? } para as telas; outros erros (de programação) continuam sendo lançados
function toFailure(error) {
  if (!(error instanceof ApiError)) throw error
  return { error: error.code, ...(error.details.fields && { fields: error.details.fields }) }
}

/**
 * Conta de cliente pela API (/auth e /me). O token de sessão vai nas chamadas pelo apiClient (getToken).
 * Os métodos de escrita retornam { customer, token? } ou { error, fields? }.
 */
export class HttpAccountRepository {
  #api

  constructor(apiClient) {
    this.#api = apiClient
  }

  async register(input) {
    try {
      return await this.#api.post('/auth/register', input)
    } catch (error) {
      return toFailure(error)
    }
  }

  async login(input) {
    try {
      return await this.#api.post('/auth/login', input)
    } catch (error) {
      return toFailure(error)
    }
  }

  async logout() {
    await this.#api.post('/auth/logout')
  }

  /** "Esqueci minha senha": { sent: true } — a API responde igual com ou sem conta — ou { error, fields? }. */
  async requestPasswordReset({ email }) {
    try {
      await this.#api.post('/auth/forgot-password', { email })
      return { sent: true }
    } catch (error) {
      return toFailure(error)
    }
  }

  /** Senha nova pelo link do e-mail: { customer, token } ou { error } (ex.: invalid_token). */
  async resetPassword({ token, password }) {
    try {
      return await this.#api.post('/auth/reset-password', { token, password })
    } catch (error) {
      return toFailure(error)
    }
  }

  /** Conta do token atual, ou null se a sessão venceu ou foi encerrada. */
  async getMe() {
    try {
      return await this.#api.get('/me', { cache: false })
    } catch (error) {
      if (error.status === 401) return null
      throw error
    }
  }

  async updateMe(input) {
    try {
      return { customer: await this.#api.patch('/me', input) }
    } catch (error) {
      return toFailure(error)
    }
  }

  async listOrders() {
    return (await this.#api.get('/me/orders', { cache: false })).map(toOrder)
  }
}
