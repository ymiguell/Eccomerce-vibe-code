/**
 * Caso de uso: dizer se a API está no ar e se consegue falar com o banco.
 * Usado pela hospedagem para monitorar o servidor e para conferir a instalação.
 * Retorna { status: 'ok' | 'degraded', database: 'up' | 'down', time }.
 */
export function makeCheckHealth(databaseStatus, { now = () => new Date() } = {}) {
  return async function checkHealth() {
    let database = 'up'
    try {
      await databaseStatus.ping()
    } catch {
      database = 'down'
    }

    return { status: database === 'up' ? 'ok' : 'degraded', database, time: now().toISOString() }
  }
}
