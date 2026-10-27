import { useEffect, useState } from 'react'

/**
 * Carrega dados de um caso de uso, com recarga. status: 'loading' | 'ready' | 'failed'.
 * `load` precisa ser estável (useCallback ou definido fora do componente): quando ele muda (ex.: outro filtro), recarrega.
 * Enquanto recarrega, `data` continua com o resultado anterior — a tela não pisca.
 * `update(fn)` troca os dados localmente (ex.: depois de salvar um item) sem ir à API de novo.
 */
export function useRemoteData(load) {
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState({ load: null, version: -1, status: 'loading', data: null })

  useEffect(() => {
    let active = true

    load()
      .then((data) => {
        if (active) setResult({ load, version, status: 'ready', data })
      })
      .catch((error) => {
        console.error('Falha ao carregar dados:', error)
        if (active) setResult((current) => ({ ...current, load, version, status: 'failed', error }))
      })

    return () => {
      active = false
    }
  }, [load, version])

  // O resultado guardado é de outra chamada (filtro mudou ou pediu recarga): ainda carregando
  const isCurrent = result.load === load && result.version === version

  return {
    status: isCurrent ? result.status : 'loading',
    data: result.data,
    error: isCurrent ? result.error : undefined,
    reload: () => setVersion((current) => current + 1),
    update: (change) => setResult((current) => ({ ...current, data: change(current.data) })),
  }
}
