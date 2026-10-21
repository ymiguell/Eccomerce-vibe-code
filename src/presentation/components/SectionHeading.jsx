// Título + frase de efeito centralizados, usados para separar seções da página
function SectionHeading({ title, description }) {
  return (
    <div className="mx-auto mt-20 max-w-2xl px-4 text-center sm:mt-24 sm:px-6">
      <h2 className="text-4xl leading-tight font-semibold sm:text-5xl">{title}</h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:mt-4 sm:text-lg">{description}</p>
      )}
    </div>
  )
}

export default SectionHeading
