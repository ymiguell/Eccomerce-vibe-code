import { useId } from 'react'
import { getRequiredOptions } from '../../domain/entities/Cart.js'
import { FALLBACK_SWATCH, colorSwatches } from '../constants/colorSwatches.js'

const chipBase =
  'flex min-h-11 items-center rounded-sm border border-border text-sm font-medium transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:border-foreground'

/**
 * Escolha de tamanho e cor (radios nativos com visual de botão).
 * Usado na janela rápida do card e na página do produto.
 * Só mostra o que o produto realmente exige (ver getRequiredOptions no domínio).
 */
function VariantSelector({ product, size, color, onSizeChange, onColorChange, sizeFirst = false }) {
  const groupName = useId()
  const required = getRequiredOptions(product)

  const sizeField = required.size && (
    <fieldset>
      <legend className="text-sm font-semibold">
        Tamanho: <span className="font-normal text-muted-foreground">{size ?? 'escolha'}</span>
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {product.sizes.map((option) => (
          <label key={option} className="cursor-pointer">
            <input
              type="radio"
              name={`${groupName}-size`}
              value={option}
              checked={size === option}
              onChange={() => onSizeChange(option)}
              className="peer sr-only"
            />
            <span
              className={`${chipBase} min-w-14 justify-center px-3 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary`}
            >
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )

  const colorField = required.color ? (
    <fieldset>
      <legend className="text-sm font-semibold">
        Cor: <span className="font-normal text-muted-foreground">{color ?? 'escolha'}</span>
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {product.colors.map((option) => (
          <label key={option} className="cursor-pointer">
            <input
              type="radio"
              name={`${groupName}-color`}
              value={option}
              checked={color === option}
              onChange={() => onColorChange(option)}
              className="peer sr-only"
            />
            <span className={`${chipBase} gap-2 px-3 peer-checked:border-primary peer-checked:ring-1 peer-checked:ring-primary`}>
              <span
                className="size-4 rounded-full border border-border"
                style={{ backgroundColor: colorSwatches[option] ?? FALLBACK_SWATCH }}
                aria-hidden="true"
              />
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  ) : (
    product.colors.length === 1 && (
      <p className="text-sm font-semibold">
        Cor: <span className="font-normal text-muted-foreground">{product.colors[0]}</span>
      </p>
    )
  )

  return (
    <div className="space-y-5">
      {sizeFirst ? sizeField : colorField}
      {sizeFirst ? colorField : sizeField}
    </div>
  )
}

export default VariantSelector
