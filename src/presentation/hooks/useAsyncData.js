import { useEffect, useState } from 'react'

/**
 * Executa um caso de uso assíncrono e devolve o resultado.
 * `load` precisa ser estável (definido fora do componente), senão o efeito roda a cada render.
 */
export function useAsyncData(load, initialValue = []) {
  const [data, setData] = useState(initialValue)

  useEffect(() => {
    let active = true

    load().then((result) => {
      if (active) setData(result)
    })

    // Evita atualizar o estado se o componente sair da tela antes da resposta
    return () => {
      active = false
    }
  }, [load])

  return data
}
