import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import logoMontreal from '../../assets/images/00-logo-montreal.svg'

// Cada link é uma página (rota). Para criar uma nova, adicione aqui e a rota correspondente no App.jsx.
const links = [
  { label: 'Home', to: '/' },
  { label: 'Moda', to: '/moda' },
  { label: 'Casa', to: '/casa' },
  { label: 'Tecnologia', to: '/tecnologia' },
  { label: 'Saúde', to: '/saude' },
  { label: 'Outlet', to: '/outlet' },
]

// NavLink adiciona aria-current="page" e aplica `activeClassName` no link da página atual
function MenuLink({ link, className, activeClassName, onClick }) {
  return (
    <NavLink
      to={link.to}
      end
      onClick={onClick}
      className={({ isActive }) => `${className} ${isActive ? activeClassName : ''}`}
    >
      {link.label}
    </NavLink>
  )
}

function NavBar({ cartCount = 0, onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const cartLabel = `${cartCount} ${cartCount === 1 ? 'item' : 'itens'} na sacola`

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      {/* Celular: logo + sacola + menu. Tablet/desktop (md+): logo | links centralizados | sacola */}
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] lg:px-8">
        {/* Logo completa (símbolo + "Montreal Moda e Casa"). width/height reservam o espaço antes de carregar */}
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="Montreal Moda e Casa, página inicial"
          className="-m-1.5 flex items-center justify-self-start rounded-sm p-1.5 transition-opacity duration-200 hover:opacity-80"
        >
          <img src={logoMontreal} alt="" width="198" height="58" className="h-10 w-auto shrink-0" />
        </Link>

        <ul className="hidden items-center gap-5 md:flex lg:gap-8">
          {links.map((link) => (
            <li key={link.to}>
              <MenuLink
                link={link}
                className="border-b-2 border-transparent py-1 text-sm font-medium text-muted-foreground hover:text-primary"
                activeClassName="border-primary! text-primary!"
              />
            </li>
          ))}
        </ul>

        <div className="-mr-2.5 flex items-center justify-self-end">
          <button
            type="button"
            onClick={() => {
              closeMenu()
              onCartClick()
            }}
            aria-label={`Abrir sacola, ${cartLabel}`}
            aria-haspopup="dialog"
            className="relative flex size-11 items-center justify-center rounded-sm text-foreground transition-colors duration-200 hover:bg-muted"
          >
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 7h12l1 14H5L6 7z" />
              <path d="M9 10V6a3 3 0 0 1 6 0v4" />
            </svg>
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] leading-none font-semibold text-white"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="flex size-11 items-center justify-center rounded-sm text-foreground transition-colors duration-200 hover:bg-muted md:hidden"
          >
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Anuncia mudanças na quantidade para leitores de tela, sem mover o foco */}
      <span role="status" aria-atomic="true" className="sr-only">
        {cartLabel}
      </span>

      {/* Menu suspenso do celular */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-border px-4 pb-4 sm:px-6 md:hidden">
          <ul className="flex flex-col py-2">
            {links.map((link) => (
              <li key={link.to}>
                <MenuLink
                  link={link}
                  onClick={closeMenu}
                  className="block rounded-sm px-2 py-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  activeClassName="bg-muted text-primary!"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

export default NavBar
