import { useId, useState } from 'react'
import { isInStock, isLowStock } from '../../../domain/entities/Product.js'
import { formatPrice } from '../../formatters/currency.js'
import ProductEditForm from './ProductEditForm.jsx'

function StockBadge({ product }) {
  if (!isInStock(product)) {
    return <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Esgotado</span>
  }
  if (isLowStock(product)) {
    return (
      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
        Estoque baixo: {product.stock}
      </span>
    )
  }
  return <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{product.stock} em estoque</span>
}

/** Produto no painel: foto, preço, estoque e destaque; "Editar" abre o formulário logo abaixo. */
function AdminProductCard({ product, onSave }) {
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const formId = useId()

  const handleSave = async (id, changes) => {
    const result = await onSave(id, changes)
    if (result.product) {
      setEditing(false)
      setSaved(true)
    }
    return result
  }

  return (
    <li className="rounded-sm border border-border p-4 sm:p-5">
      <div className="flex gap-3 sm:gap-4">
        <div className="size-16 shrink-0 rounded-sm bg-muted sm:size-20">
          {product.imageUrl && (
            <img src={product.imageUrl} alt="" width="80" height="80" loading="lazy" className="size-full rounded-sm bg-white object-cover" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="leading-snug font-semibold">{product.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{product.category}</p>
          <p className="mt-1.5 text-sm">
            <span className="font-semibold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="ml-2 text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StockBadge product={product} />
            {product.isFeatured && <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">Destaque</span>}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(!editing)
            setSaved(false)
          }}
          aria-expanded={editing}
          aria-controls={editing ? formId : undefined}
          className="h-11 shrink-0 self-start rounded-sm border border-border px-4 text-sm font-semibold transition-colors duration-200 hover:border-foreground"
        >
          {editing ? 'Fechar' : 'Editar'}
        </button>
      </div>

      <div aria-live="polite">{saved && <p className="mt-3 text-sm font-medium">Alterações salvas.</p>}</div>

      {editing && (
        <div id={formId} className="mt-4 border-t border-border pt-4">
          <ProductEditForm product={product} onSave={handleSave} onCancel={() => setEditing(false)} />
        </div>
      )}
    </li>
  )
}

export default AdminProductCard
