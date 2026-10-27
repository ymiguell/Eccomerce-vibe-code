const buttonClass =
  'min-h-11 rounded-sm border border-border px-4 text-sm font-semibold transition-colors duration-200 hover:border-foreground disabled:pointer-events-none disabled:opacity-40'

/** "Anterior · Página 2 de 5 · Próxima". Some quando tudo cabe numa página. */
function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null

  return (
    <nav aria-label="Páginas" className="flex items-center justify-between gap-3">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className={buttonClass}>
        Anterior
      </button>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Página {page} de {pages}
      </p>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= pages} className={buttonClass}>
        Próxima
      </button>
    </nav>
  )
}

export default Pagination
