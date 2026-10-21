import { useEffect } from 'react'

const STORE_NAME = 'Montreal Moda e Casa'

/** Atualiza o título da aba do navegador ao entrar em cada página. */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${STORE_NAME}` : STORE_NAME
  }, [title])
}
