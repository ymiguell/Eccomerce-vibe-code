import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { needsOptionSelection } from '../../domain/entities/Cart.js'
import { getDiscountPercent, isInStock } from '../../domain/entities/Product.js'
import { useCartContext } from '../context/cartContext.js'
import { formatPrice } from '../formatters/currency.js'
import ProductOptionsDialog from './ProductOptionsDialog.jsx'

/**
 * Card de produto.
 * - Clicar em qualquer parte abre o produto: o link do nome é "esticado" (after:inset-0) sobre o card.
 * - O botão da sacola fica por cima do link (z-10), então não há elemento interativo dentro de outro.
 * - `@container` adapta o card à PRÓPRIA largura: estreito (ex.: 2 colunas no celular) esconde a descrição.
 */
function ProductCard({ product }) {
  const { add } = useCartContext()
  const [justAdded, setJustAdded] = useState(false)
  const [choosingOptions, setChoosingOptions] = useState(false)
  const discount = getDiscountPercent(product)
  const available = isInStock(product)
  const hasOptions = needsOptionSelection(product)

  // Mostra o "✓ adicionado" por um instante e volta ao ícone da sacola
  useEffect(() => {
    if (!justAdded) return
    const timer = setTimeout(() => setJustAdded(false), 1500)
    return () => clearTimeout(timer)
  }, [justAdded])

  const addToCart = (options) => {
    add(product, options)
    setJustAdded(true)
  }

  // Com tamanho/cor para escolher, abre a janela de opções; senão vai direto para a sacola
  const handleAdd = () => (hasOptions ? setChoosingOptions(true) : addToCart())

  const buttonLabel = !available
    ? `${product.name} esgotado`
    : justAdded
      ? `${product.name} adicionado à sacola`
      : `Adicionar ${product.name} à sacola`

  return (
    <article className="group @container relative flex h-full flex-col overflow-hidden rounded-sm border border-border bg-surface transition-shadow duration-200 hover:shadow-lg has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent">
      {/* Foto quadrada (1:1), igual às fotos do catálogo; sem foto, mostra um espaço reservado */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted text-sm text-muted-foreground">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            width="600"
            height="600"
            loading="lazy"
            decoding="async"
            className="h-full w-full bg-white object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          'Imagem do produto'
        )}
        {discount > 0 && (
          <span className="absolute top-3 left-3 rounded-sm bg-sale px-2 py-1 text-xs font-semibold text-white">
            -{discount}%
          </span>
        )}
        {!available && (
          <span className="absolute top-3 right-3 rounded-sm bg-foreground px-2 py-1 text-xs font-semibold text-white">
            Esgotado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 @[15rem]:p-5">
        <span className="text-xs font-semibold tracking-widest text-accent uppercase">{product.category}</span>
        <h3 className="mt-1 text-base leading-snug font-semibold @[15rem]:text-xl">
          <Link to={`/produto/${product.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        {product.description && (
          <p className="mt-2 hidden text-sm leading-relaxed text-muted-foreground @[15rem]:block">{product.description}</p>
        )}

        {/* mt-auto empurra preço e botão para o rodapé, alinhando os cards de alturas diferentes */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3 @[15rem]:pt-4">
          <div className="flex min-w-0 flex-col">
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
            <span className={`text-lg font-semibold ${discount > 0 ? 'text-sale' : ''}`}>{formatPrice(product.price)}</span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!available}
            aria-label={buttonLabel}
            aria-haspopup={hasOptions ? 'dialog' : undefined}
            title={available ? 'Adicionar à sacola' : 'Esgotado'}
            className={`relative z-10 flex size-11 shrink-0 items-center justify-center rounded-sm text-on-primary transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground ${
              justAdded ? 'bg-primary-hover' : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {justAdded ? (
                <path d="M5 12.5l4.5 4.5L19 7.5" strokeWidth="2.25" />
              ) : (
                <>
                  {/* Sacola (mesmo desenho da NavBar) com um "+" */}
                  <path d="M6 7h12l1 14H5L6 7z" />
                  <path d="M9 10V6a3 3 0 0 1 6 0v4" />
                  <path d="M12 12.5v5M9.5 15h5" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {choosingOptions && (
        <ProductOptionsDialog product={product} onClose={() => setChoosingOptions(false)} onConfirm={addToCart} />
      )}
    </article>
  )
}

export default ProductCard
