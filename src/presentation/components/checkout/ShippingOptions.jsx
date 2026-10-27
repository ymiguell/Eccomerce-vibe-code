import { shippingServiceName } from '../../../domain/services/shipping.js'
import { formatPrice } from '../../formatters/currency.js'
import { formatDeliveryWindow } from '../../formatters/order.js'

const optionClass =
  'flex cursor-pointer items-center gap-3 rounded-sm border border-border bg-surface px-4 py-3 transition-colors duration-200 hover:border-foreground has-checked:border-primary has-checked:bg-primary/5'

function OptionText({ option }) {
  return (
    <>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{shippingServiceName(option)}</span>
        <span className="block text-xs text-muted-foreground">Chega em {formatDeliveryWindow(option)}</span>
      </span>
      <span className={`shrink-0 font-semibold ${option.price === 0 ? 'text-primary' : ''}`}>
        {option.price === 0 ? 'Frete grátis' : formatPrice(option.price)}
      </span>
    </>
  )
}

/**
 * Opções de frete (da mais barata para a mais cara).
 * Com `onSelect`, vira uma escolha (botões de opção, para o checkout); sem ele, só mostra (página do produto).
 */
function ShippingOptions({ options, name, selectedId = null, onSelect }) {
  if (!onSelect) {
    return (
      <ul className="space-y-2">
        {options.map((option) => (
          <li key={option.id} className="flex items-center gap-3 rounded-sm bg-surface px-4 py-3">
            <OptionText option={option} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.id} className={optionClass}>
          <input
            type="radio"
            name={name}
            value={option.id}
            checked={selectedId === option.id}
            onChange={() => onSelect(option)}
            className="size-4 shrink-0 accent-primary"
          />
          <OptionText option={option} />
        </label>
      ))}
    </div>
  )
}

export default ShippingOptions
