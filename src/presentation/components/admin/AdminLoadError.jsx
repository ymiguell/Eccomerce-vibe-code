import { formatAdminError } from '../../formatters/adminErrors.js'

/** Falha ao carregar uma lista do painel: o motivo (sessão, acesso, conexão) e um botão para tentar de novo. */
function AdminLoadError({ error, onRetry }) {
  return (
    <div role="alert" className="rounded-sm border border-border p-6 text-center">
      <p className="font-semibold">Não conseguimos carregar esta lista</p>
      <p className="mt-1 text-sm text-muted-foreground">{formatAdminError(error?.code)}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 min-h-11 rounded-sm border border-border px-5 text-sm font-semibold transition-colors duration-200 hover:border-foreground"
      >
        Tentar de novo
      </button>
    </div>
  )
}

export default AdminLoadError
