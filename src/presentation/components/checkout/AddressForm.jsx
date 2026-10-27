import { useEffect, useRef, useState } from 'react'
import { BRAZILIAN_STATES, validateAddress } from '../../../domain/entities/Address.js'
import { isValidCep, normalizeCep } from '../../../domain/services/shipping.js'
import { formatCep } from '../../formatters/masks.js'
import { formatShippingError } from '../../formatters/shippingErrors.js'
import { useForm } from '../../hooks/useForm.js'
import FormField from '../form/FormField.jsx'
import { primaryButtonClass } from '../form/formStyles.js'
import ShippingOptions from './ShippingOptions.jsx'

const EMPTY_ADDRESS = { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' }

const lookupMessages = {
  loading: 'Buscando endereço…',
  not_found: 'Não encontramos esse CEP. Confira os números ou preencha o endereço abaixo.',
  unavailable: 'Não conseguimos buscar o endereço agora. Preencha os campos abaixo.',
}

const IDLE_QUOTE = { status: 'idle', options: null, error: null }

/**
 * Etapa 2 do checkout: endereço de entrega e escolha do frete.
 * Ao completar o CEP, preenche rua, bairro, cidade e estado (findAddressByCep) e cota o frete da sacola (quoteShipping).
 * `initialQuote`: { options, optionId } já escolhidos, ao voltar para esta etapa.
 * `onSubmit(address, shipping, options)`: `shipping` é a opção escolhida.
 */
function AddressForm({ initialValues = EMPTY_ADDRESS, initialQuote = null, items, findAddressByCep, quoteShipping, onSubmit }) {
  const form = useForm(initialValues, validateAddress)
  const [lookupStatus, setLookupStatus] = useState('idle') // idle | loading | found | not_found | unavailable
  const [quote, setQuote] = useState(initialQuote ? { status: 'done', options: initialQuote.options, error: null } : IDLE_QUOTE)
  const [selectedId, setSelectedId] = useState(initialQuote?.optionId ?? null)
  const [missingShipping, setMissingShipping] = useState(false)
  // Último CEP buscado: se a pessoa trocar o CEP antes da resposta, a resposta antiga é ignorada
  const latestCep = useRef(normalizeCep(initialValues.cep))

  const runQuote = async (cep) => {
    setQuote({ status: 'loading', options: null, error: null })
    let result
    try {
      result = await quoteShipping(cep, items)
    } catch (error) {
      console.error('Falha ao calcular o frete:', error)
      result = { error: 'shipping_unavailable' }
    }
    if (latestCep.current !== cep) return

    if (result.options) {
      setQuote({ status: 'done', options: result.options, error: null })
      // Mantém a escolha se ela ainda existe; senão, já deixa marcada a mais barata
      setSelectedId((current) => (result.options.some((option) => option.id === current) ? current : result.options[0].id))
    } else {
      setQuote({ status: 'error', options: null, error: result.error })
    }
  }

  // Endereço já preenchido (última compra ou volta para esta etapa): cota o frete ao abrir
  useEffect(() => {
    if (!initialQuote && isValidCep(initialValues.cep)) runQuote(normalizeCep(initialValues.cep))
    // Só ao abrir a etapa
  }, [])

  const handleCepChange = async (value) => {
    const cep = normalizeCep(value)
    if (cep === latestCep.current) return
    latestCep.current = cep
    setMissingShipping(false)

    if (!isValidCep(cep)) {
      setLookupStatus('idle')
      setQuote(IDLE_QUOTE)
      return
    }

    setLookupStatus('loading')
    runQuote(cep)
    const lookup = await findAddressByCep(cep)
    if (latestCep.current !== cep) return

    if (lookup.address) {
      // Só o que o serviço trouxe: CEP de cidade inteira vem sem rua e bairro
      form.fill(Object.fromEntries(Object.entries(lookup.address).filter(([, text]) => text)))
      setLookupStatus('found')
    } else {
      setLookupStatus(lookup.error)
    }
  }

  const selected = quote.options?.find((option) => option.id === selectedId) ?? null

  const handleSubmit = (values) => {
    if (!selected) {
      setMissingShipping(true)
      return
    }
    onSubmit(values, selected, quote.options)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="grid grid-cols-6 gap-4">
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
          hint={lookupMessages[lookupStatus]}
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

      <fieldset className="col-span-6" aria-describedby={missingShipping ? 'frete-erro' : undefined}>
        <legend className="text-sm font-medium">Frete</legend>
        <div aria-live="polite" className="mt-2 text-sm">
          {quote.status === 'idle' && <p className="text-muted-foreground">Digite o CEP para ver as opções de entrega.</p>}
          {quote.status === 'loading' && <p className="text-muted-foreground">Calculando o frete…</p>}
          {quote.status === 'error' && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p className="font-medium text-primary">{formatShippingError(quote.error)}</p>
              {quote.error !== 'invalid_cep' && (
                <button
                  type="button"
                  onClick={() => runQuote(latestCep.current)}
                  className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:text-primary"
                >
                  Tentar de novo
                </button>
              )}
            </div>
          )}
        </div>
        {quote.status === 'done' && (
          <ShippingOptions
            name="frete"
            options={quote.options}
            selectedId={selectedId}
            onSelect={(option) => {
              setSelectedId(option.id)
              setMissingShipping(false)
            }}
          />
        )}
        {missingShipping && (
          <p id="frete-erro" className="mt-2 text-sm font-medium text-primary">
            Escolha uma opção de frete para continuar.
          </p>
        )}
      </fieldset>

      <div className="col-span-6">
        <button type="submit" disabled={lookupStatus === 'loading' || quote.status === 'loading'} className={primaryButtonClass}>
          Ir para o pagamento
        </button>
      </div>
    </form>
  )
}

export default AddressForm
