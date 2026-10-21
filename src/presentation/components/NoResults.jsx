// Mensagem quando os filtros não deixam nenhum produto, com a ação para sair dessa situação
function NoResults({ onClearFilters }) {
  return (
    <div className="mx-auto mt-10 max-w-md px-4 text-center">
      <p className="font-serif text-2xl font-semibold">Nenhum produto encontrado</p>
      <p className="mt-2 text-sm text-muted-foreground">Tente remover alguns filtros ou escolher outras opções.</p>
      <button
        type="button"
        onClick={onClearFilters}
        className="mt-6 rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-colors duration-200 hover:bg-primary-hover"
      >
        Limpar filtros
      </button>
    </div>
  )
}

export default NoResults
