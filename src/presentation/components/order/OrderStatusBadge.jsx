import { formatOrderStatus } from '../../formatters/order.js'

// Aguardando pagamento chama atenção (vermelho); cancelado fica apagado; o resto, neutro. O texto sempre diz a situação.
const TONES = {
  pending_payment: 'bg-primary/10 text-primary',
  canceled: 'border border-border text-muted-foreground',
}

/** Selo com a situação do pedido ("Aguardando pagamento", "Enviado"...). Usado em "Minha conta" e no painel. */
function OrderStatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${TONES[status] ?? 'bg-muted text-foreground'}`}>
      {formatOrderStatus(status)}
    </span>
  )
}

export default OrderStatusBadge
