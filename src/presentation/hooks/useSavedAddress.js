import { useEffect, useState } from 'react'

/**
 * Endereço da última compra de quem está logado (null enquanto carrega, sem login ou sem compras).
 * `getSavedAddress` precisa ser estável (vem da composição em App.jsx).
 */
export function useSavedAddress(getSavedAddress, customerId) {
  const [saved, setSaved] = useState({ customerId: null, address: null })

  useEffect(() => {
    if (!getSavedAddress || !customerId) return
    let active = true

    getSavedAddress()
      .then((address) => {
        if (active) setSaved({ customerId, address })
      })
      // Sem o endereço salvo o checkout continua normal, só vem em branco
      .catch((error) => console.error('Falha ao buscar o último endereço:', error))

    return () => {
      active = false
    }
  }, [getSavedAddress, customerId])

  // Resultado de outra conta (trocou de login) não vale
  return saved.customerId === customerId ? saved.address : null
}
