// Carrinho de exemplo, só para visualizarmos o layout. Depois vira localStorage ou API.
const mockCartItems = [
  { productId: 'camiseta-oversized-preta', size: 'G', color: 'Preto', quantity: 2 },
  { productId: 'calca-jeans-slim', size: '40', color: 'Azul', quantity: 1 },
  { productId: 'tenis-casual-couro', size: '41', color: 'Marrom', quantity: 1 },
]

export class MockCartRepository {
  async getItems() {
    return mockCartItems
  }
}
