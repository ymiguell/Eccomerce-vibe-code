import { getItemKey, getLineTotal } from '../../../domain/entities/Cart.js'
import { formatPrice } from '../../formatters/currency.js'

/** Lista compacta dos itens (resumo do checkout e confirmação do pedido). */
function OrderItemList({ items }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((item) => {
        const variant = [item.size && `Tamanho ${item.size}`, item.color].filter(Boolean).join(' · ')

        return (
          <li key={getItemKey(item)} className="flex gap-3 py-3">
            <div className="relative size-16 shrink-0 rounded-sm bg-muted">
              {item.product.imageUrl && (
                <img
                  src={item.product.imageUrl}
                  alt=""
                  width="64"
                  height="64"
                  loading="lazy"
                  className="size-full rounded-sm bg-white object-cover"
                />
              )}
              <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="leading-snug font-semibold">{item.product.name}</p>
              {variant && <p className="mt-0.5 text-xs text-muted-foreground">{variant}</p>}
              <p className="sr-only">Quantidade: {item.quantity}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold">{formatPrice(getLineTotal(item))}</p>
          </li>
        )
      })}
    </ul>
  )
}

export default OrderItemList
