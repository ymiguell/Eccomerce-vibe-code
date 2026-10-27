// Mensagens para os erros do painel (códigos da API e dos casos de uso)
const messages = {
  invalid_transition: 'O pedido não pode ir para esta situação.',
  status_changed: 'Este pedido mudou enquanto a tela estava aberta. Atualize a lista.',
  order_not_found: 'Pedido não encontrado. Atualize a lista.',
  product_not_found: 'Produto não encontrado. Atualize a lista.',
  coupon_not_found: 'Cupom não encontrado. Atualize a lista.',
  code_taken: 'Já existe um cupom com este código.',
  unauthorized: 'Sua sessão terminou. Entre de novo para continuar.',
  forbidden: 'Sua conta não tem mais acesso ao painel.',
  network_error: 'Não conseguimos falar com o servidor. Confira sua conexão e tente de novo.',
}

export function formatAdminError(code) {
  return messages[code] ?? 'Algo deu errado. Tente de novo em instantes.'
}
