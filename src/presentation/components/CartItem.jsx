import { MAX_QUANTITY, getItemKey, getLineTotal } from '../../domain/entities/Cart.js'
import { formatPrice } from '../formatters/currency.js'

const stepperButton =
  'flex size-11 items-center justify-center text-foreground transition-colors duration-200 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent'

function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  const { product, quantity, size, color } = item
  const key = getItemKey(item)
  // Ex.: "Tamanho G · Preto" — aparece na linha e nos rótulos dos botões
  const variant = [size && `Tamanho ${size}`, color].filter(Boolean).join(' · ')
  const itemName = variant ? `${product.name} (${variant})` : product.name

  return (
    <li className="flex gap-4 py-5">
      {/* Espaço provisório para a foto do produto */}
      <div className="aspect-square w-20 shrink-0 overflow-hidden rounded-sm bg-muted sm:w-24" aria-hidden="true">
        {product.imageUrl && (
          <img src={product.imageUrl} alt="" width="96" height="96" loading="lazy" className="h-full w-full bg-white object-cover" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-widest text-accent uppercase">{product.category}</p>
            <h3 className="mt-0.5 font-sans text-sm leading-snug font-semibold">{product.name}</h3>
            {variant && <p className="mt-0.5 text-xs text-muted-foreground">{variant}</p>}
            <p className="mt-1 text-sm text-muted-foreground">
              {product.originalPrice && (
                <span className="mr-1.5 line-through">{formatPrice(product.originalPrice)}</span>
              )}
              <span className={product.originalPrice ? 'text-sale' : ''}>{formatPrice(product.price)}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => onRemove(key)}
            aria-label={`Remover ${itemName} da sacola`}
            className="-mt-2.5 -mr-2.5 flex size-11 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex items-center rounded-sm border border-border">
            <button
              type="button"
              onClick={() => onDecrement(key)}
              disabled={quantity <= 1}
              aria-label={`Diminuir quantidade de ${itemName}`}
              className={stepperButton}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14" />
              </svg>
            </button>
            <span className="w-8 text-center text-sm font-semibold" aria-live="polite" aria-label={`Quantidade: ${quantity}`}>
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(key)}
              disabled={quantity >= MAX_QUANTITY}
              aria-label={`Aumentar quantidade de ${itemName}`}
              className={stepperButton}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          <span className="text-sm font-semibold">{formatPrice(getLineTotal(item))}</span>
        </div>
      </div>
    </li>
  )
}

export default CartItem
