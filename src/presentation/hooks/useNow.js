import { useEffect, useState } from 'react'

/** Hora atual, atualizada a cada `intervalMs` (1 segundo por padrão). Usada pela contagem regressiva. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}
