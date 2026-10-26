import { useEffect, useState } from 'react'

/**
 * Executa um caso de uso assíncrono e devolve o resultado.
 * `load` precisa ser estável (definido fora do componente), senão o efeito roda a cada render.
 * Se falhar (ex.: API fora do ar), mantém o valor inicial: a tela fica vazia em vez de quebrar.
 */
export function useAsyncData(load, initialValue = []) {
  const [data, setData] = useState(initialValue)

  useEffect(() => {
    let active = true

    load()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((error) => console.error('Falha ao carregar dados:', error))

    // Evita atualizar o estado se o componente sair da tela antes da resposta
    return () => {
      active = false
    }
  }, [load])

  return data
}
