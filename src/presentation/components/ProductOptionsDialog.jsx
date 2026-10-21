import { useEffect, useId, useRef, useState } from 'react'
import { getMissingOptions } from '../../domain/entities/Cart.js'
import { formatPrice } from '../formatters/currency.js'
import { describeMissingOptions } from '../formatters/options.js'
import VariantSelector from './VariantSelector.jsx'

/**
 * Janela para escolher tamanho e/ou cor antes de pôr o produto na sacola.
 * Usa o <dialog> nativo: foco preso dentro, Esc fecha e o fundo escurece sozinho.
 * Celular: abre de baixo para cima (bottom sheet). Desktop: centralizada.
 * Montada só enquanto aberta, então cada abertura começa sem nada selecionado.
 */
function ProductOptionsDialog({ product, onClose, onConfirm }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const [size, setSize] = useState(null)
  const [color, setColor] = useState(null)

  const missing = getMissingOptions(product, { size, color })
  const canConfirm = missing.length === 0

  useEffect(() => {
    // O StrictMode roda o efeito duas vezes em desenvolvimento; abrir de novo uma janela já aberta daria erro
    if (!dialogRef.current.open) dialogRef.current.showModal()
  }, [])

  const close = () => dialogRef.current.close()

  const handleConfirm = () => {
    onConfirm({ size, color })
    close()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      // Clique no fundo escuro (fora do conteúdo) fecha
      onClick={(event) => event.target === dialogRef.current && close()}
      className="m-0 mt-auto max-h-[85vh] w-full max-w-none rounded-t-lg bg-surface p-0 text-foreground shadow-2xl backdrop:bg-black/40 sm:m-auto sm:max-w-md sm:rounded-sm"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt=""
              width="80"
              height="80"
              className="size-20 shrink-0 rounded-sm border border-border bg-white object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-widest text-accent uppercase">{product.category}</p>
            <h2 id={titleId} className="mt-1 text-2xl leading-tight font-semibold">
              {product.name}
            </h2>
            <p className="mt-1 font-semibold">{formatPrice(product.price)}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="-mt-2 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-sm transition-colors duration-200 hover:bg-muted"
          >
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-6">
          <VariantSelector product={product} size={size} color={color} onSizeChange={setSize} onColorChange={setColor} sizeFirst />
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="mt-8 w-full rounded-sm bg-primary px-6 py-3.5 text-sm font-semibold tracking-wide text-on-primary uppercase transition-colors duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          Adicionar à sacola
        </button>
        {/* Explica por que o botão está desabilitado */}
        <p className="mt-2 min-h-5 text-center text-sm text-muted-foreground" aria-live="polite">
          {describeMissingOptions(missing)}
        </p>
      </div>
    </dialog>
  )
}

export default ProductOptionsDialog
