// Mensagens para os erros do painel (códigos da API e dos casos de uso)
const messages = {
  invalid_transition: 'O pedido não pode ir para esta situação.',
  not_shipped: 'O pedido ainda não foi enviado.',
  status_changed: 'Este pedido mudou enquanto a tela estava aberta. Atualize a lista.',
  order_not_found: 'Pedido não encontrado. Atualize a lista.',
  product_not_found: 'Produto não encontrado. Atualize a lista.',
  coupon_not_found: 'Cupom não encontrado. Atualize a lista.',
  code_taken: 'Já existe um cupom com este código.',
  review_not_found: 'Avaliação não encontrada. Atualize a lista.',
  subscriber_not_found: 'Este e-mail já não estava na lista.',
  invalid_image: 'Esta foto não pôde ser usada. Escolha uma em JPG, PNG ou WebP.',
  image_too_large: 'A foto ficou grande demais. Escolha uma menor.',
  unauthorized: 'Sua sessão terminou. Entre de novo para continuar.',
  forbidden: 'Sua conta não tem mais acesso ao painel.',
  network_error: 'Não conseguimos falar com o servidor. Confira sua conexão e tente de novo.',
}

export function formatAdminError(code) {
  return messages[code] ?? 'Algo deu errado. Tente de novo em instantes.'
}
