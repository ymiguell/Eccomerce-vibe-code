import { useCallback, useState } from 'react'
import { PRICE_RANGES, SORT_OPTIONS } from '../../domain/services/productCatalog.js'
import { FALLBACK_SWATCH, colorSwatches } from '../constants/colorSwatches.js'
import FilterDropdown from './FilterDropdown.jsx'

function CheckboxOption({ label, count, checked, onChange, swatch }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm px-2 text-sm hover:bg-muted">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 shrink-0 accent-primary" />
      {swatch && (
        <span className="size-4 shrink-0 rounded-full border border-border" style={{ backgroundColor: swatch }} aria-hidden="true" />
      )}
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">{count}</span>}
    </label>
  )
}

function ViewToggleIcon({ cells }) {
  // 2×2 quadrados (ampliada) ou 3×3 (compacta), como nas lojas
  const size = cells === 2 ? 8 : 5
  const gap = cells === 2 ? 2 : 1.5
  const squares = []
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      squares.push(<rect key={`${row}-${col}`} x={3 + col * (size + gap)} y={3 + row * (size + gap)} width={size} height={size} rx="0.5" />)
    }
  }
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {squares}
    </svg>
  )
}

/**
 * Barra de filtros da listagem. Só desenha e repassa eventos;
 * o estado e as regras ficam no hook useProductFilters e no domínio.
 */
// Nomes dos filtros que mudam conforme o nicho (ex.: "Tecido" em Moda, "Material" em Casa)
const DEFAULT_LABELS = { category: 'Tipo de peça', size: 'Tamanho', fabric: 'Tecido' }

function ProductFilterBar({ catalog, total, density, onDensityChange, labels = DEFAULT_LABELS }) {
  const { filters, options, sortBy, setSortBy, toggleValue, setOnlyInStock, clearFilters, activeCount } = catalog
  const [openId, setOpenId] = useState(null)
  const close = useCallback(() => setOpenId(null), [])
  const dropdownProps = (id) => ({ isOpen: openId === id, onToggle: () => setOpenId(openId === id ? null : id), onClose: close })

  // Filtros ativos viram "chips" removíveis abaixo da barra
  const priceLabel = (id) => PRICE_RANGES.find((range) => range.id === id)?.label
  const chips = [
    ...filters.categories.map((value) => ({ key: `c-${value}`, label: value, remove: () => toggleValue('categories', value) })),
    ...filters.sizes.map((value) => ({ key: `s-${value}`, label: `${labels.size} ${value}`, remove: () => toggleValue('sizes', value) })),
    ...filters.colors.map((value) => ({ key: `k-${value}`, label: value, remove: () => toggleValue('colors', value) })),
    ...filters.priceRanges.map((value) => ({ key: `p-${value}`, label: priceLabel(value), remove: () => toggleValue('priceRanges', value) })),
    ...filters.fabrics.map((value) => ({ key: `f-${value}`, label: value, remove: () => toggleValue('fabrics', value) })),
    ...(filters.onlyInStock ? [{ key: 'stock', label: 'Em estoque', remove: () => setOnlyInStock(false) }] : []),
  ]

  const sortLabel = SORT_OPTIONS.find((option) => option.id === sortBy)?.label

  return (
    <div className="mx-auto mt-8 max-w-7xl px-4 sm:mt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 border-b border-border pb-2 lg:flex-row lg:items-center lg:justify-between">
        {/* Filtros (esquerda) */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          {options.categories.length > 0 && (
          <FilterDropdown label={labels.category} badge={filters.categories.length} {...dropdownProps('categories')}>
            {options.categories.map(({ value, count }) => (
              <CheckboxOption
                key={value}
                label={value}
                count={count}
                checked={filters.categories.includes(value)}
                onChange={() => toggleValue('categories', value)}
              />
            ))}
          </FilterDropdown>
          )}

          {options.sizes.length > 0 && (
          <FilterDropdown label={labels.size} badge={filters.sizes.length} {...dropdownProps('sizes')}>
            <div className="grid grid-cols-4 gap-2">
              {options.sizes.map(({ value }) => {
                const selected = filters.sizes.includes(value)
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleValue('sizes', value)}
                    aria-pressed={selected}
                    className={`min-h-11 rounded-sm border text-sm font-medium transition-colors duration-200 ${
                      selected ? 'border-primary bg-primary text-on-primary' : 'border-border hover:border-foreground'
                    }`}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </FilterDropdown>
          )}

          {options.colors.length > 0 && (
          <FilterDropdown label="Cor" badge={filters.colors.length} {...dropdownProps('colors')}>
            {options.colors.map(({ value, count }) => (
              <CheckboxOption
                key={value}
                label={value}
                count={count}
                swatch={colorSwatches[value] ?? FALLBACK_SWATCH}
                checked={filters.colors.includes(value)}
                onChange={() => toggleValue('colors', value)}
              />
            ))}
          </FilterDropdown>
          )}

          <FilterDropdown label="Preço" badge={filters.priceRanges.length} {...dropdownProps('price')}>
            {options.priceRanges.map(({ value, label, count }) => (
              <CheckboxOption
                key={value}
                label={label}
                count={count}
                checked={filters.priceRanges.includes(value)}
                onChange={() => toggleValue('priceRanges', value)}
              />
            ))}
          </FilterDropdown>

          {options.fabrics.length > 0 && (
          <FilterDropdown label={labels.fabric} badge={filters.fabrics.length} {...dropdownProps('fabrics')}>
            {options.fabrics.map(({ value, count }) => (
              <CheckboxOption
                key={value}
                label={value}
                count={count}
                checked={filters.fabrics.includes(value)}
                onChange={() => toggleValue('fabrics', value)}
              />
            ))}
          </FilterDropdown>
          )}

          <FilterDropdown label="Disponibilidade" badge={filters.onlyInStock ? 1 : 0} {...dropdownProps('stock')}>
            <CheckboxOption
              label="Somente em estoque"
              count={options.inStockCount}
              checked={filters.onlyInStock}
              onChange={(event) => setOnlyInStock(event.target.checked)}
            />
          </FilterDropdown>
        </div>

        {/* Contagem, ordenação e visualização (direita) */}
        <div className="flex items-center justify-between gap-6 lg:justify-end">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {total} {total === 1 ? 'item' : 'itens'}
          </p>

          <div className="flex items-center gap-4">
            <FilterDropdown label={sortBy === 'relevance' ? 'Classificar' : `Classificar: ${sortLabel}`} align="right" {...dropdownProps('sort')}>
              <div role="radiogroup" aria-label="Ordenar por">
                {SORT_OPTIONS.map((option) => (
                  <label key={option.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm px-2 text-sm hover:bg-muted">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortBy === option.id}
                      onChange={() => {
                        setSortBy(option.id)
                        close()
                      }}
                      className="size-4 accent-primary"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </FilterDropdown>

            {/* Ampliada: 1 coluna no celular → 3 no desktop · Compacta: 2 colunas no celular → 4 no desktop */}
            <div className="flex items-center gap-1" role="group" aria-label="Visualização">
              {[
                { id: 'comfortable', cells: 2, label: 'Visualização ampliada' },
                { id: 'compact', cells: 3, label: 'Visualização compacta' },
              ].map((view) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => onDensityChange(view.id)}
                  aria-pressed={density === view.id}
                  aria-label={view.label}
                  className={`flex size-11 items-center justify-center rounded-sm transition-colors duration-200 ${
                    density === view.id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ViewToggleIcon cells={view.cells} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.remove}
              aria-label={`Remover filtro ${chip.label}`}
              className="flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-sm transition-colors duration-200 hover:border-primary hover:text-primary"
            >
              {chip.label}
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          ))}
          {activeCount > 1 && (
            <button type="button" onClick={clearFilters} className="min-h-11 px-2 text-sm font-medium text-primary underline underline-offset-4">
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductFilterBar
