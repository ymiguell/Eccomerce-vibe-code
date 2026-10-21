import { useState } from 'react'

/**
 * Galeria de fotos: imagem principal + miniaturas.
 * Com uma foto só, mostra apenas a principal; o contador e as miniaturas aparecem a partir de 2.
 */
function ProductGallery({ images, name }) {
  const [current, setCurrent] = useState(0)
  const total = images.length

  if (total === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-sm bg-muted text-sm text-muted-foreground">
        Imagem do produto
      </div>
    )
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-sm border border-border bg-white">
        <img
          src={images[current]}
          alt={total > 1 ? `${name}, foto ${current + 1} de ${total}` : name}
          width="1200"
          height="1200"
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
        {total > 1 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-foreground/80 px-2.5 py-1 text-xs font-semibold text-white">
            {current + 1}/{total}
          </span>
        )}
      </div>

      {total > 1 && (
        <ul className="mt-3 flex gap-2" aria-label="Fotos do produto">
          {images.map((image, index) => (
            <li key={image}>
              <button
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Ver foto ${index + 1} de ${total}`}
                aria-current={index === current}
                className={`size-16 overflow-hidden rounded-sm border-2 bg-white transition-colors duration-200 sm:size-20 ${
                  index === current ? 'border-primary' : 'border-transparent hover:border-border'
                }`}
              >
                <img src={image} alt="" width="80" height="80" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProductGallery
