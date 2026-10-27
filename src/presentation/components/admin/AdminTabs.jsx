import { NavLink } from 'react-router'

const TABS = [
  { to: '/admin', label: 'Pedidos', end: true },
  { to: '/admin/produtos', label: 'Produtos' },
  { to: '/admin/cupons', label: 'Cupons' },
  { to: '/admin/avaliacoes', label: 'Avaliações' },
  { to: '/admin/newsletter', label: 'Newsletter' },
]

/**
 * Abas do painel. Cada aba tem o próprio endereço: dá para voltar, recarregar e compartilhar o link.
 * No celular a fileira rola para o lado (sem barra: a aba cortada na borda mostra que tem mais).
 */
function AdminTabs() {
  return (
    <nav aria-label="Seções do painel" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 border-b border-border sm:min-w-0">
        {TABS.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `-mb-px flex min-h-11 items-center border-b-2 px-3 whitespace-nowrap text-sm font-semibold transition-colors duration-200 sm:px-4 ${
                  isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default AdminTabs
