// Guarda os pedidos só em memória e simula a demora de uma API. Depois vira uma chamada real.
// Nada é salvo no navegador: os dados do cliente somem ao fechar a página.
const NETWORK_DELAY_MS = 900

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export class MockOrderRepository {
  #orders = []

  async save(order) {
    await wait(NETWORK_DELAY_MS)
    this.#orders.push(order)
  }
}
