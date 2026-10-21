import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * Ao trocar de página, volta ao topo. Se o link tiver âncora (ex.: /#contato), rola até a seção.
 * O React Router não faz isso sozinho.
 */
export function useScrollOnNavigate() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }

    window.scrollTo(0, 0)
  }, [pathname, hash])
}
