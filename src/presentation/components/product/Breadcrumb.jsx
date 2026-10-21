import { Link } from 'react-router'

/** Trilha de navegação, ex.: Home › Moda › Calça Jeans. O último item é a página atual (sem link). */
function Breadcrumb({ items }) {
  return (
    <nav aria-label="Trilha de navegação" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.label} className="flex min-w-0 items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="truncate font-medium text-foreground">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link to={item.to} className="hover:text-primary">
                    {item.label}
                  </Link>
                  <span aria-hidden="true">›</span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
