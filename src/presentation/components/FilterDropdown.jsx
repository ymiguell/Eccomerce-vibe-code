import { useEffect, useId, useRef } from 'react'

/**
 * Botão com painel suspenso, usado em cada filtro da barra.
 * Desktop: painel abaixo do botão. Celular: painel fixo na parte de baixo da tela (bottom sheet).
 * Fecha ao clicar fora ou com Esc. O controle de "qual está aberto" fica com o componente pai.
 */
function FilterDropdown({ label, badge = 0, isOpen, onToggle, onClose, align = 'left', children }) {
  const panelId = useId()
  const containerRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event) => {
      if (!containerRef.current.contains(event.target)) onClose()
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        buttonRef.current.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`flex min-h-11 items-center gap-1.5 text-sm whitespace-nowrap transition-colors duration-200 hover:text-primary ${
          isOpen || badge > 0 ? 'text-primary' : 'text-foreground'
        }`}
      >
        {label}
        {badge > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-on-primary">
            {badge}
          </span>
        )}
        <svg
          className={`size-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Fundo escuro só no celular */}
          <div className="fixed inset-0 z-40 bg-black/30 sm:hidden" aria-hidden="true" onClick={onClose} />
          <div
            id={panelId}
            role="group"
            aria-label={label}
            className={`fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-lg border border-border bg-surface p-4 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:mt-2 sm:max-h-96 sm:w-72 sm:rounded-sm sm:shadow-lg ${
              align === 'right' ? 'sm:right-0' : 'sm:left-0'
            }`}
          >
            <div className="mb-2 flex items-center justify-between sm:hidden">
              <p className="font-semibold">{label}</p>
              <button type="button" onClick={onClose} className="min-h-11 px-2 text-sm font-medium text-primary">
                Ver resultados
              </button>
            </div>
            {children}
          </div>
        </>
      )}
    </div>
  )
}

export default FilterDropdown
