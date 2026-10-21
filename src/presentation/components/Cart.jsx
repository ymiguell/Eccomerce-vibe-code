import { useEffect, useRef } from 'react'
import { FREE_SHIPPING_THRESHOLD, getItemKey } from '../../domain/entities/Cart.js'
import { formatPrice } from '../formatters/currency.js'
import CartItem from './CartItem.jsx'
import CouponForm from './CouponForm.jsx'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Sacola em painel lateral (drawer) que desliza da direita.
 * Fecha pelo X, pelo fundo escuro ou pela tecla Esc; o foco fica preso dentro enquanto aberta.
 */
function Cart({ isOpen, onClose, cart }) {
  const panelRef = useRef(null)
  const closeButtonRef = useRef(null)
  const { items, totals, coupon, count } = cart

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement
    closeButtonRef.current.focus()

    // Trava a rolagem da página por trás do painel
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()

      // Mantém o Tab circulando só dentro do painel
      if (event.key === 'Tab') {
        const focusable = panelRef.current.querySelectorAll(FOCUSABLE)
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [isOpen, onClose])

  const shippingProgress = Math.min(100, (totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    // Fica sempre montado para a animação de saída; `inert` tira tudo do foco/leitor de tela quando fechado
    <div className={`fixed inset-0 z-[60] ${isOpen ? '' : 'pointer-events-none'}`} inert={!isOpen}>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3 sm:px-6">
          <h2 id="cart-title" className="text-2xl font-semibold">
            Sua sacola <span className="font-sans text-base font-normal text-muted-foreground">({count})</span>
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar sacola"
            className="-mr-2.5 flex size-11 items-center justify-center rounded-sm transition-colors duration-200 hover:bg-muted"
          >
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-serif text-2xl font-semibold">Sua sacola está vazia</p>
            <p className="text-sm text-muted-foreground">Que tal dar uma olhada nas novidades?</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-sm bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-colors duration-200 hover:bg-primary-hover"
            >
              Continuar comprando
            </button>
          </div>
        ) : (
          <>
            {/* Área rolável: frete grátis, itens e cupom */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6">
              <div className="border-b border-border py-4">
                <p className="text-sm">
                  {totals.missingForFreeShipping > 0 ? (
                    <>
                      Faltam <strong>{formatPrice(totals.missingForFreeShipping)}</strong> para o frete grátis
                    </>
                  ) : (
                    <strong className="text-accent">Você ganhou frete grátis!</strong>
                  )}
                </p>
                <div
                  role="progressbar"
                  aria-label="Progresso para frete grátis"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(shippingProgress)}
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-300 motion-reduce:transition-none"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <CartItem
                    key={getItemKey(item)}
                    item={item}
                    onIncrement={cart.increment}
                    onDecrement={cart.decrement}
                    onRemove={cart.remove}
                  />
                ))}
              </ul>

              <div className="border-t border-border py-5">
                <CouponForm
                  coupon={coupon}
                  discount={totals.discount}
                  onApply={cart.redeemCoupon}
                  onRemove={cart.removeCoupon}
                />
              </div>
            </div>

            {/* Rodapé fixo: resumo e finalizar */}
            <div className="border-t border-border bg-surface px-5 pt-4 pb-5 sm:px-6">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatPrice(totals.subtotal)}</dd>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-accent">
                    <dt>Desconto ({coupon.code})</dt>
                    <dd>-{formatPrice(totals.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Frete</dt>
                  <dd>{totals.shipping === 0 ? 'Grátis' : formatPrice(totals.shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{formatPrice(totals.total)}</dd>
                </div>
              </dl>
              <p className="mt-1 text-right text-xs text-muted-foreground">
                ou {totals.installments}x de {formatPrice(totals.installmentValue)} sem juros
              </p>

              <a
                href="#checkout"
                onClick={onClose}
                className="mt-4 block rounded-sm bg-primary px-6 py-3.5 text-center text-sm font-semibold tracking-wide text-on-primary uppercase transition-colors duration-200 hover:bg-primary-hover"
              >
                Finalizar compra
              </a>
              <button
                type="button"
                onClick={onClose}
                className="mt-1 w-full py-3 text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Continuar comprando
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

export default Cart
