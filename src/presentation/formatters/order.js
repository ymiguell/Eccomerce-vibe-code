import { PAYMENT_METHODS } from '../../domain/services/payment.js'
import { formatPrice } from './currency.js'
import { formatCep } from './masks.js'

/** Endereço em 3 linhas: rua e número · bairro e cidade · CEP */
export function formatAddressLines(address) {
  const complement = address.complement ? ` – ${address.complement}` : ''
  return [
    `${address.street}, ${address.number}${complement}`,
    `${address.neighborhood} – ${address.city}/${address.state}`,
    `CEP ${formatCep(address.cep)}`,
  ]
}

export function formatDeliveryWindow({ minDays, maxDays }) {
  return `${minDays} a ${maxDays} dias úteis`
}

/** Ex.: "Pix" ou "Cartão de crédito em 3x de R$ 66,63" */
export function formatPayment(payment) {
  if (payment.method === PAYMENT_METHODS.PIX) return 'Pix'
  if (payment.installments === 1) return 'Cartão de crédito à vista'
  return `Cartão de crédito em ${payment.installments}x de ${formatPrice(payment.installmentValue)} sem juros`
}
