/** "Descrição completa": texto do produto + ficha técnica. Começa aberta; <details> nativo abre/fecha. */
function ProductDetails({ product }) {
  const specs = [
    ['Categoria', product.category],
    ['Material', product.fabric],
    ['Cores', product.colors.join(', ')],
    ['Tamanhos', product.sizes.join(', ')],
    ['Código', product.id],
  ].filter(([, value]) => value)

  return (
    <details open className="group border-y border-border">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
        Descrição completa
        <svg className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </summary>

      <div className="grid gap-6 pb-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-12">
        <p className="leading-relaxed text-muted-foreground">{product.description}</p>
        <dl className="divide-y divide-border rounded-sm border border-border text-sm">
          {specs.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  )
}

export default ProductDetails
