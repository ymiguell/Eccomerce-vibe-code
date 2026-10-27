import { useState } from 'react'

/** Código de rastreio com botão "Copiar" (para colar no site da transportadora). */
function TrackingCode({ code }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Navegador sem permissão para copiar: o código continua visível para copiar à mão
    }
  }

  return (
    <div className="mt-2">
      <p className="text-muted-foreground">Código de rastreio</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="font-mono font-semibold tracking-wide text-foreground select-all">{code}</span>
        <button
          type="button"
          onClick={copy}
          className="min-h-11 rounded-sm px-2 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
        <span aria-live="polite" className="sr-only">
          {copied ? 'Código copiado' : ''}
        </span>
      </div>
    </div>
  )
}

export default TrackingCode
