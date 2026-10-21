import logoUrl from '../../assets/images/m-branco.png'

/**
 * Logo "M". O PNG original é branco, então ele é usado como máscara:
 * o formato vem da imagem e a cor vem do texto (`text-primary`, `text-white`...).
 * Assim a mesma imagem fica vermelha no fundo branco e branca no fundo vermelho.
 */
function Logo({ className = '' }) {
  const mask = `url(${logoUrl}) center / contain no-repeat`

  return (
    <span
      aria-hidden="true"
      className={`inline-block aspect-[183/202] bg-current ${className}`}
      style={{ mask, WebkitMask: mask }}
    />
  )
}

export default Logo
