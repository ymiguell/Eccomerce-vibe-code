/** Blocos cinza no lugar da lista enquanto ela carrega (reserva o espaço, a tela não pula). */
function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-sm bg-muted motion-reduce:animate-none" />
      ))}
    </div>
  )
}

export default ListSkeleton
