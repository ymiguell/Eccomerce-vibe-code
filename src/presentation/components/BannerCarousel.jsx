import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

// Cores provisórias até os banners ganharem imagens/design próprio
const placeholderColors = ['bg-primary', 'bg-foreground', 'bg-footer', 'bg-red-950']

const SWIPE_THRESHOLD = 50

// Rotas internas (ex.: '/moda') usam o Link do React Router, sem recarregar a página; o resto vira <a> comum
function BannerLink({ href, ...props }) {
  return href.startsWith('/') ? <Link to={href} {...props} /> : <a href={href} {...props} />
}

function BannerCarousel({ banners, interval = 5000 }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  // Quem pediu menos movimento no sistema não recebe troca automática
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const touchStartX = useRef(null)

  const total = banners.length

  const goTo = (index) => setCurrent((index + total) % total)
  const next = () => goTo(current + 1)
  const prev = () => goTo(current - 1)

  // Troca automática. Depende de `current` para reiniciar o tempo após uma navegação manual.
  useEffect(() => {
    if (paused || reduceMotion || total < 2) return

    const timer = setInterval(() => {
      setCurrent((index) => (index + 1) % total)
    }, interval)

    return () => clearInterval(timer)
  }, [paused, reduceMotion, total, interval, current])

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX
    setPaused(true)
  }

  const handleTouchEnd = (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX.current

    if (distance > SWIPE_THRESHOLD) prev()
    if (distance < -SWIPE_THRESHOLD) next()

    touchStartX.current = null
    setPaused(false)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') prev()
    if (event.key === 'ArrowRight') next()
  }

  // Banners só de arte seguem a proporção das imagens (quadrada no celular, 1920×600 no desktop),
  // assim o texto embutido nunca é cortado. Banners com texto usam alturas fixas.
  const isArtwork = banners.every((banner) => banner.imageUrl && !banner.showText)
  const heightClasses = isArtwork ? 'aspect-square md:aspect-[16/5]' : 'h-56 sm:h-72 md:h-80 lg:h-96'

  // Indicadores: o ponto é pequeno, mas a área de toque (botão) tem 32px.
  // Sobre a imagem ficam brancos; abaixo dela (banners de arte), cinza com o atual em vermelho.
  const dots = (
    <div className="flex">
      {banners.map((banner, index) => (
        <button
          key={banner.id}
          type="button"
          onClick={() => goTo(index)}
          aria-label={`Ir para o banner ${index + 1}`}
          aria-current={index === current}
          className="flex h-8 items-center px-1.5"
        >
          <span
            className={`block h-2 rounded-full transition-all duration-300 ${
              index === current
                ? `w-6 ${isArtwork ? 'bg-primary' : 'bg-white'}`
                : `w-2 ${isArtwork ? 'bg-foreground/20 hover:bg-foreground/40' : 'bg-white/50 hover:bg-white/80'}`
            }`}
          />
        </button>
      ))}
    </div>
  )

  // Reserva o espaço enquanto os banners carregam, evitando "pulo" no layout
  if (total === 0) {
    return (
      <div className="mx-auto mt-4 max-w-7xl px-4 sm:mt-6 sm:px-6 lg:px-8">
        <div className={`${heightClasses} animate-pulse rounded-sm bg-muted`} />
      </div>
    )
  }

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Promoções e novidades"
      className="mx-auto mt-4 max-w-7xl px-4 sm:mt-6 sm:px-6 lg:px-8"
    >
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`group relative overflow-hidden rounded-sm ${heightClasses}`}
      >
        {/* Trilho com todos os slides lado a lado; desliza via translateX */}
        <div
          className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} de ${total}`}
              aria-hidden={index !== current}
              className={`relative flex h-full w-full shrink-0 items-center ${placeholderColors[index % placeholderColors.length]}`}
            >
              {banner.imageUrl && (
                <>
                  {/* Celular usa a versão quadrada (se houver); a partir de 768px, a versão larga */}
                  <picture>
                    {banner.mobileImageUrl && <source media="(max-width: 767px)" srcSet={banner.mobileImageUrl} />}
                    <img
                      src={banner.imageUrl}
                      alt=""
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </picture>
                  {/* Escurece a imagem do lado do texto para manter a leitura */}
                  {banner.showText && <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/30 to-transparent" />}
                </>
              )}

              {banner.showText ? (
                <div className="relative max-w-2xl px-6 text-white sm:px-12 md:px-16">
                  <h2 className="text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl lg:text-6xl">{banner.title}</h2>
                  {banner.subtitle && (
                    <p className="mt-2 text-sm text-white/90 sm:mt-3 sm:text-base md:text-lg">{banner.subtitle}</p>
                  )}
                  <BannerLink
                    href={banner.ctaHref}
                    tabIndex={index === current ? 0 : -1}
                    className="mt-4 inline-block rounded-sm bg-white px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted sm:mt-6 sm:px-6 sm:py-3"
                  >
                    {banner.ctaLabel}
                  </BannerLink>
                </div>
              ) : (
                // Arte com texto embutido: o banner inteiro é o link, e o título fica para leitores de tela
                <BannerLink href={banner.ctaHref} tabIndex={index === current ? 0 : -1} className="absolute inset-0">
                  <span className="sr-only">
                    {banner.title}. {banner.ctaLabel}
                  </span>
                </BannerLink>
              )}
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            {/* Setas: no celular a navegação é pelo arraste (swipe) e pelos pontos */}
            <button
              type="button"
              onClick={prev}
              aria-label="Banner anterior"
              className="absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full bg-white/85 p-3 text-foreground shadow transition duration-200 hover:bg-white sm:block md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próximo banner"
              className="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full bg-white/85 p-3 text-foreground shadow transition duration-200 hover:bg-white sm:block md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {!isArtwork && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 sm:bottom-2">{dots}</div>}
          </>
        )}
      </div>

      {/* Em banners de arte, os pontos ficam abaixo da imagem para não cobrir o texto e o "Compre" da arte */}
      {isArtwork && total > 1 && <div className="mt-1 flex justify-center">{dots}</div>}
    </section>
  )
}

export default BannerCarousel
