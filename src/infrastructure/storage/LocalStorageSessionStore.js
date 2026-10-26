/*
 * Guarda o token de login no navegador, para o cliente continuar logado ao voltar ao site.
 * Só o token fica aqui (nunca a senha); ao sair da conta ele é apagado aqui e invalidado no servidor.
 */
const STORAGE_KEY = 'montreal:sessao'

export class LocalStorageSessionStore {
  get() {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      // Armazenamento bloqueado (ex.: navegação anônima): o login vale só enquanto a página estiver aberta
      return this.memory ?? null
    }
  }

  save(token) {
    this.memory = token
    try {
      localStorage.setItem(STORAGE_KEY, token)
    } catch {
      // Sem armazenamento: fica só na memória
    }
  }

  clear() {
    this.memory = null
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Nada a apagar
    }
  }
}
