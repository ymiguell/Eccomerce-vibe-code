/**
 * Filtros em "pílulas" (um escolhido por vez). `options`: [{ value, label, count? }].
 * No celular a fileira rola para o lado (sem barra: a pílula cortada na borda já mostra que tem mais); a partir do tablet, quebra linha.
 */
function FilterChips({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
              selected ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`text-xs ${selected ? 'text-background/80' : 'text-muted-foreground'}`}>{option.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default FilterChips
