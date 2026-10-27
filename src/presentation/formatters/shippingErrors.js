// Por que o frete não foi calculado (códigos do caso de uso quoteShipping e da API)
const SHIPPING_ERRORS = {
  invalid_cep: 'CEP inválido. Digite os 8 números do seu CEP.',
  shipping_unavailable: 'Não conseguimos calcular o frete agora. Tente de novo em instantes.',
  network_error: 'Não conseguimos falar com o servidor. Confira sua conexão e tente de novo.',
  too_many_requests: 'Muitas consultas seguidas. Aguarde um minuto e tente de novo.',
}

export function formatShippingError(code) {
  return SHIPPING_ERRORS[code] ?? SHIPPING_ERRORS.shipping_unavailable
}
