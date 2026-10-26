import { useRef, useState } from 'react'
import { BRAZILIAN_STATES, validateAddress } from '../../../domain/entities/Address.js'
import { isValidCep, normalizeCep } from '../../../domain/services/shipping.js'
import { formatPrice } from '../../formatters/currency.js'
import { formatCep } from '../../formatters/masks.js'
import { formatDeliveryWindow } from '../../formatters/order.js'
import { useForm } from '../../hooks/useForm.js'
import FormField from '../form/FormField.jsx'
import { primaryButtonClass } from '../form/formStyles.js'

const EMPTY_ADDRESS = { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' }

const lookupMessages = {
  loading: 'Buscando endereço…',
  not_found: 'Não encontramos esse CEP. Confira os números ou preencha o endereço abaixo.',
  unavailable: 'Não conseguimos buscar o endereço agora. Preencha os campos abaixo.',
}

/**
 * Etapa 2 do checkout: endereço de entrega.
 * Ao completar o CEP, preenche rua, bairro, cidade e estado (findAddressByCep) e mostra prazo e frete.
 */
function AddressForm({ initialValues = EMPTY_ADDRESS, initialEstimate = null, subtotal, findAddressByCep, estimateShipping, onSubmit }) {
  const form = useForm(initialValues, validateAddress)
  const [lookupStatus, setLookupStatus] = useState('idle') // idle | loading | found | not_found | unavailable
  const [estimate, setEstimate] = useState(initialEstimate)
  // Último CEP buscado: se a pessoa trocar o CEP antes da resposta, a resposta antiga é ignorada
  const latestCep = useRef(normalizeCep(initialValues.cep))

  const handleCepChange = async (value) => {
    const cep = normalizeCep(value)
    if (cep === latestCep.current) return
    latestCep.current = cep

    if (!isValidCep(cep)) {
      setLookupStatus('idle')
      setEstimate(null)
      return
    }

    setLookupStatus('loading')
    const [lookup, shipping] = await Promise.all([findAddressByCep(cep), estimateShipping(cep, subtotal)])
    if (latestCep.current !== cep) return

    setEstimate(shipping.estimate ?? null)
    if (lookup.address) {
      // Só o que o serviço trouxe: CEP de cidade inteira vem sem rua e bairro
      form.fill(Object.fromEntries(Object.entries(lookup.address).filter(([, text]) => text)))
      setLookupStatus('found')
    } else {
      setLookupStatus(lookup.error)
    }
  }

  const cepHint = (
    <>
      {lookupMessages[lookupStatus] && <p>{lookupMessages[lookupStatus]}</p>}
      {estimate && (
        <p className="mt-2 flex items-center justify-between gap-3 rounded-sm bg-muted px-3 py-2.5 text-foreground">
          <span>
            <span className="font-semibold">Entrega padrão</span>
            <span className="block text-xs text-muted-foreground">Chega em {formatDeliveryWindow(estimate)}</span>
          </span>
          <span className={`shrink-0 font-semibold ${estimate.fee === 0 ? 'text-primary' : ''}`}>
            {estimate.fee === 0 ? 'Frete grátis' : formatPrice(estimate.fee)}
          </span>
        </p>
      )}
    </>
  )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid grid-cols-6 gap-4">
      <div className="col-span-6 sm:col-span-3">
        <FormField
          form={form}
          name="cep"
          label="CEP"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          maxLength={9}
          format={formatCep}
          onValueChange={handleCepChange}
          hint={cepHint}
        />
        <a
          href="https://buscacepinter.correios.com.br/app/endereco/index.php"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex min-h-8 items-center text-xs font-medium underline underline-offset-2 hover:text-primary"
        >
          Não sei meu CEP
        </a>
      </div>

      <FormField form={form} name="street" label="Rua ou avenida" autoComplete="address-line1" className="col-span-6 sm:col-span-4" />
      <FormField form={form} name="number" label="Número" autoComplete="off" className="col-span-2" />
      <FormField
        form={form}
        name="complement"
        label="Complemento"
        optional
        autoComplete="address-line2"
        placeholder="Apto, bloco, casa"
        className="col-span-4 sm:col-span-6"
      />
      <FormField form={form} name="neighborhood" label="Bairro" autoComplete="address-level3" className="col-span-6 sm:col-span-2" />
      <FormField form={form} name="city" label="Cidade" autoComplete="address-level2" className="col-span-4 sm:col-span-3" />
      <FormField form={form} name="state" label="Estado" autoComplete="address-level1" className="col-span-2 sm:col-span-1">
        <option value="">UF</option>
        {BRAZILIAN_STATES.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </FormField>

      <div className="col-span-6">
        <button type="submit" disabled={lookupStatus === 'loading'} className={primaryButtonClass}>
          Ir para o pagamento
        </button>
      </div>
    </form>
  )
}

export default AddressForm
