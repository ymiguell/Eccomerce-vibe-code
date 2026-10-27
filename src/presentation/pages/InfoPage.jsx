import { NavLink } from 'react-router'
import { INFO_GROUPS, INFO_PAGES } from '../content/infoPages.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

function InfoTable({ table }) {
  return (
    // Tabela larga rola dentro do próprio quadro no celular, sem empurrar a página para o lado
    <div className="mt-4 overflow-x-auto rounded-sm border border-border">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{table.caption}</caption>
        <thead className="bg-muted">
          <tr>
            {table.columns.map((column) => (
              <th key={column} scope="col" className="px-3 py-3 font-semibold whitespace-nowrap sm:px-4">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {table.rows.map(([first, ...rest]) => (
            <tr key={first}>
              <th scope="row" className="px-3 py-3 font-semibold whitespace-nowrap sm:px-4">
                {first}
              </th>
              {rest.map((cell, index) => (
                <td key={table.columns[index + 1]} className="px-3 py-3 whitespace-nowrap tabular-nums sm:px-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InfoFaq({ items }) {
  return (
    <ul className="divide-y divide-border rounded-sm border border-border">
      {items.map((item) => (
        <li key={item.question}>
          {/* <details>: abre e fecha sem JavaScript e funciona no teclado */}
          <details className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
              {item.question}
              <svg
                className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <p className="px-4 pb-4 text-muted-foreground">{item.answer}</p>
          </details>
        </li>
      ))}
    </ul>
  )
}

function InfoSection({ section }) {
  return (
    <section className="mt-8 first:mt-0">
      {section.heading && <h2 className="text-xl font-semibold">{section.heading}</h2>}
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mt-3 leading-relaxed text-muted-foreground">
          {paragraph}
        </p>
      ))}
      {section.list && (
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground marker:text-primary">
          {section.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {section.table && <InfoTable table={section.table} />}
      {section.faq && <InfoFaq items={section.faq} />}
    </section>
  )
}

/** Links para as outras páginas do mesmo grupo (Institucional ou Ajuda). */
function InfoNav({ group }) {
  return (
    <nav aria-label={INFO_GROUPS[group]}>
      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">{INFO_GROUPS[group]}</p>
      <ul className="mt-3 space-y-1">
        {INFO_PAGES.filter((page) => page.group === group).map((page) => (
          <li key={page.slug}>
            <NavLink
              to={`/${page.slug}`}
              className={({ isActive }) =>
                `flex min-h-11 items-center border-l-2 pl-3 text-sm transition-colors duration-200 ${
                  isActive ? 'border-primary font-semibold text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {page.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Páginas do rodapé (/sobre-nos, /trocas-e-devolucoes...): conteúdo em content/infoPages.js. */
function InfoPage({ page }) {
  usePageTitle(page.title)

  return (
    <main className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <article className="max-w-3xl lg:col-start-2 lg:row-start-1">
          <h1 className="text-3xl font-semibold sm:text-4xl">{page.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{page.summary}</p>
          <div className="mt-8">
            {page.sections.map((section, index) => (
              <InfoSection key={section.heading ?? index} section={section} />
            ))}
          </div>
        </article>

        {/* No celular vem depois do texto; no computador, na coluna da esquerda */}
        <aside className="border-t border-border pt-8 lg:col-start-1 lg:row-start-1 lg:border-t-0 lg:pt-1">
          <InfoNav group={page.group} />
        </aside>
      </div>
    </main>
  )
}

export default InfoPage
