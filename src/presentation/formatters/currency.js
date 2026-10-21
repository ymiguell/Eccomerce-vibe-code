const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatPrice(value) {
  return priceFormatter.format(value)
}
