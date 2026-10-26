/*
 * Guarda a sacola no navegador (localStorage): ela continua lá ao atualizar a página ou voltar outro dia.
 * Fica só o id do produto, a variação e a quantidade (ver toCartEntry no domínio).
 * Depois pode virar uma API sem mudar os casos de uso: basta manter getItems e saveItems.
 */
const STORAGE_KEY = 'montreal:sacola'

export class LocalStorageCartRepository {
  async getItems() {
    try {
      const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      return Array.isArray(entries) ? entries : []
    } catch {
      // Armazenamento bloqueado (ex.: navegação anônima) ou dado corrompido: começa com a sacola vazia
      return []
    }
  }

  async saveItems(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
      // Sem armazenamento a sacola continua funcionando, só não fica salva
    }
  }
}
