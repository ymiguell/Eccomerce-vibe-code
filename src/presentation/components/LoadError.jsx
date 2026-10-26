/** Aviso de falha ao carregar dados (ex.: API fora do ar), com opção de tentar de novo. */
function LoadError({ title = 'Não conseguimos carregar esta página' }) {
  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-muted-foreground">
        Pode ser uma instabilidade na conexão ou no servidor. Tente de novo em alguns instantes.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-8 inline-block min-h-11 rounded-sm bg-primary px-6 py-3 text-sm font-semibold tracking-wide text-on-primary uppercase transition-colors duration-200 hover:bg-primary-hover"
      >
        Tentar de novo
      </button>
    </main>
  )
}

export default LoadError
