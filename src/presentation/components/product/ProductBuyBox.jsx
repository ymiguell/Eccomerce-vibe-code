import { useState } from 'react'
import { getMissingOptions } from '../../../domain/entities/Cart.js'
import { getDiscountPercent, isInStock, isLowStock } from '../../../domain/entities/Product.js'
import { PIX_DISCOUNT_PERCENT, getInstallments, getPixPrice } from '../../../domain/services/payment.js'
import { FREE_SHIPPING_THRESHOLD, hasFreeShipping } from '../../../domain/services/shipping.js'
import { useCartContext } from '../../context/cartContext.js'
import { formatPrice } from '../../formatters/currency.js'
import { describeMissingOptions } from '../../formatters/options.js'
import VariantSelector from '../VariantSelector.jsx'
import ShippingCalculator from './ShippingCalculator.jsx'

function Benefit({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 rounded-sm border border-primary/20 bg-primary/5 px-3 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {icon}
        </svg>
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </div>
  )
}

/**
 * Coluna de compra: preço, formas de pagamento, benefícios, escolha de tamanho/cor,
 * botão de adicionar à sacola e cálculo de frete.
 */
function ProductBuyBox({ product, quoteShipping }) {
  const { add, openCart } = useCartContext()
  const [size, setSize] = useState(null)
  const [color, setColor] = useState(null)
  const [triedWithoutOptions, setTriedWithoutOptions] = useState(false)

  const discount = getDiscountPercent(product)
  const available = isInStock(product)
  const installments = getInstallments(product.price)
  const missing = getMissingOptions(product, { size, color })

  const handleAdd = () => {
    // Em vez de desabilitar o botão, explica o que falta quando a pessoa tenta comprar
    if (missing.length > 0) {
      setTriedWithoutOptions(true)
      return
    }
    add(product, { size, color })
    openCart()
  }

  return (
    <div className="space-y-6">
      {/* Preço e pagamento */}
      <div>
        {product.originalPrice && (
          <p className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            <span className="rounded-sm bg-sale px-1.5 py-0.5 text-xs font-semibold text-white">-{discount}%</span>
          </p>
        )}
        <p className={`text-3xl font-bold sm:text-4xl ${discount > 0 ? 'text-sale' : ''}`}>{formatPrice(product.price)}</p>
        <p className="mt-1 flex items-center gap-2 text-sm">
          <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5.5" width="18" height="13" rx="2" />
            <path d="M3 10h18M7 15h3" />
          </svg>
          <span>
            ou <strong>
              {installments.count}x de {formatPrice(installments.value)}
            </strong>{' '}
            sem juros
          </span>
        </p>
        <p className="mt-3 rounded-sm border border-primary/25 bg-primary/5 px-4 py-2.5 text-sm text-primary">
          <strong>{formatPrice(getPixPrice(product.price))}</strong> no Pix ({PIX_DISCOUNT_PERCENT}% de desconto)
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Benefit
          title="Frete grátis"
          subtitle={hasFreeShipping(product.price) ? 'para este produto' : `acima de ${formatPrice(FREE_SHIPPING_THRESHOLD)}`}
          icon={
            <>
              <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
              <circle cx="7" cy="17.5" r="1.5" />
              <circle cx="17.5" cy="17.5" r="1.5" />
            </>
          }
        />
        <Benefit title="Envio em até 48h" subtitle="após a confirmação do pagamento" icon={<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />} />
      </div>

      {available ? (
        <>
          <div>
            <VariantSelector product={product} size={size} color={color} onSizeChange={setSize} onColorChange={setColor} sizeFirst />
            <p role="alert" className="mt-2 min-h-5 text-sm font-medium text-primary">
              {triedWithoutOptions && describeMissingOptions(missing)}
            </p>
          </div>

          {isLowStock(product) && (
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="size-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none" aria-hidden="true" />
              Últimas {product.stock} unidades em estoque
            </p>
          )}

          <button
            type="button"
            onClick={handleAdd}
            className="w-full rounded-sm bg-primary px-6 py-4 text-sm font-semibold tracking-wide text-on-primary uppercase transition-colors duration-200 hover:bg-primary-hover"
          >
            Adicionar à sacola · {formatPrice(product.price)}
          </button>
        </>
      ) : (
        <button type="button" disabled className="w-full cursor-not-allowed rounded-sm bg-muted px-6 py-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Produto esgotado
        </button>
      )}

      <ShippingCalculator product={product} quoteShipping={quoteShipping} />
    </div>
  )
}

export default ProductBuyBox
