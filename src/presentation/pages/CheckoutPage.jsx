import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { calculateOrderTotals } from '../../domain/entities/Order.js'
import { PAYMENT_METHODS } from '../../domain/services/payment.js'
import AddressForm from '../components/checkout/AddressForm.jsx'
import LoadError from '../components/LoadError.jsx'
import CheckoutSection from '../components/checkout/CheckoutSection.jsx'
import CheckoutSteps from '../components/checkout/CheckoutSteps.jsx'
import CustomerForm from '../components/checkout/CustomerForm.jsx'
import OrderSummary from '../components/checkout/OrderSummary.jsx'
import PaymentForm from '../components/checkout/PaymentForm.jsx'
import { CHECKOUT_STEPS } from '../components/checkout/checkoutStyles.js'
import { useCartContext } from '../context/cartContext.js'
import { formatPrice } from '../formatters/currency.js'
import { formatAddressLines, formatDeliveryWindow } from '../formatters/order.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

const container = 'mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'

// Por que o pedido não foi gravado (códigos do caso de uso placeOrder e da API)
const placeOrderErrors = {
  empty_cart: () => 'Sua sacola está vazia.',
  out_of_stock: () => 'Um dos produtos não tem mais estoque suficiente. Revise a sacola e tente de novo.',
  invalid_data: () => 'Confira os dados de identificação e entrega e tente de novo.',
  invalid_item: () => 'Confira tamanho, cor e quantidade dos produtos na sacola.',
  product_not_found: () => 'Um dos produtos não está mais disponível. Remova-o da sacola e tente de novo.',
  invalid_coupon: () => 'O cupom aplicado não é mais válido. Remova-o e finalize de novo.',
  coupon_min_subtotal: ({ minSubtotal }) =>
    `O cupom vale para compras a partir de ${formatPrice(minSubtotal)}. Remova-o ou adicione produtos.`,
  price_changed: ({ total }) =>
    `Os preços foram atualizados e o total agora é ${formatPrice(total)}. Atualize a página para ver os novos valores.`,
  network_error: () => 'Não conseguimos falar com o servidor. Confira sua conexão e tente de novo.',
}
const unknownError = () => 'Não foi possível finalizar o pedido. Tente de novo em instantes.'

function LockIcon() {
  return (
    <svg className="size-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function EmptyCheckout() {
  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Sua sacola está vazia</h1>
      <p className="mt-3 text-muted-foreground">Adicione produtos para finalizar a compra.</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-sm bg-primary px-6 py-3 text-sm font-semibold tracking-wide text-on-primary uppercase transition-colors duration-200 hover:bg-primary-hover"
      >
        Ir para a loja
      </Link>
    </main>
  )
}

/**
 * Checkout (/checkout) em 3 etapas na mesma página: Identificação → Entrega → Pagamento.
 * Cada etapa concluída vira um resumo com "Alterar". O resumo do pedido acompanha ao lado (ou no topo, no celular).
 * Ao finalizar, vai para /pedido-confirmado levando o pedido e esvazia a sacola.
 */
function CheckoutPage({ placeOrder, findAddressByCep, estimateShipping }) {
  usePageTitle('Finalizar compra')
  const cart = useCartContext()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [customer, setCustomer] = useState(null)
  const [address, setAddress] = useState(null)
  const [delivery, setDelivery] = useState(null)
  const [payment, setPayment] = useState({ method: null, installments: 1 })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Ao trocar de etapa (não no carregamento), leva o foco e a tela até o título da etapa aberta
  const shouldFocusStep = useRef(false)
  useEffect(() => {
    if (!shouldFocusStep.current) return
    const heading = document.getElementById(`etapa-${step}`)
    heading?.focus({ preventScroll: true })
    heading?.scrollIntoView({ block: 'start' })
  }, [step])

  const goToStep = (number) => {
    shouldFocusStep.current = true
    setStep(number)
  }

  const totalsFor = (option) => calculateOrderTotals(cart.items, cart.coupon, option)
  const totals = totalsFor(payment)

  // Se a sacola mudar e o total cair, as parcelas escolhidas podem passar do máximo permitido
  const effectivePayment =
    payment.method === PAYMENT_METHODS.CREDIT_CARD
      ? { ...payment, installments: Math.min(payment.installments, totals.installments) }
      : payment

  if (cart.loadFailed) return <LoadError title="Não conseguimos carregar sua sacola" />
  if (!cart.isLoaded) return <main className="min-h-[60vh]" aria-busy="true" />
  if (cart.items.length === 0 && !submitting) return <EmptyCheckout />

  const handleCustomerSubmit = (values) => {
    setCustomer(values)
    goToStep(address ? 3 : 2)
  }

  const handleAddressSubmit = async (values) => {
    const { estimate } = await estimateShipping(values.cep, totals.subtotal)
    setAddress(values)
    setDelivery(estimate)
    goToStep(3)
  }

  const handlePlaceOrder = async () => {
    setSubmitting(true)
    setSubmitError('')

    let result
    try {
      result = await placeOrder({ items: cart.items, coupon: cart.coupon, customer, address, payment: effectivePayment })
    } catch (error) {
      // Erro inesperado (ex.: falha no servidor): o cliente pode tentar de novo
      console.error('Falha ao finalizar o pedido:', error)
      result = { error: 'unknown' }
    }

    if (result.order) {
      // `replace`: o botão Voltar não reabre o checkout de um pedido já feito
      navigate('/pedido-confirmado', { replace: true, state: { order: result.order } })
      cart.clear()
      return
    }

    setSubmitting(false)
    setSubmitError((placeOrderErrors[result.error] ?? unknownError)(result))
  }

  const statusOf = (number) => (number < step ? 'done' : number === step ? 'current' : 'upcoming')

  return (
    <main className={`${container} pt-6 pb-16 sm:pt-8`}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h1 className="text-3xl font-semibold sm:text-4xl">Finalizar compra</h1>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <LockIcon />
          Compra segura
        </p>
      </div>

      <div className="mt-5 max-w-xl">
        <CheckoutSteps current={step} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10">
        <div className="lg:sticky lg:top-24 lg:order-last lg:self-start">
          <OrderSummary cart={cart} totals={totals} payment={effectivePayment} />
        </div>

        <div className="space-y-4">
          <CheckoutSection
            number={1}
            title={CHECKOUT_STEPS[0]}
            status={statusOf(1)}
            onEdit={() => goToStep(1)}
            summary={
              customer && (
                <>
                  <p className="font-medium text-foreground">{customer.name}</p>
                  <p>{customer.email}</p>
                  <p>{customer.phone}</p>
                </>
              )
            }
          >
            <CustomerForm initialValues={customer ?? undefined} onSubmit={handleCustomerSubmit} />
          </CheckoutSection>

          <CheckoutSection
            number={2}
            title={CHECKOUT_STEPS[1]}
            status={statusOf(2)}
            onEdit={() => goToStep(2)}
            summary={
              address && (
                <>
                  {formatAddressLines(address).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  {delivery && (
                    <p className="mt-1.5 font-medium text-foreground">Chega em {formatDeliveryWindow(delivery)}</p>
                  )}
                </>
              )
            }
          >
            <AddressForm
              initialValues={address ?? undefined}
              initialEstimate={delivery}
              subtotal={totals.subtotal}
              findAddressByCep={findAddressByCep}
              estimateShipping={estimateShipping}
              onSubmit={handleAddressSubmit}
            />
          </CheckoutSection>

          <CheckoutSection number={3} title={CHECKOUT_STEPS[2]} status={statusOf(3)}>
            <PaymentForm
              payment={effectivePayment}
              onChange={setPayment}
              totalsFor={totalsFor}
              onSubmit={handlePlaceOrder}
              submitting={submitting}
              submitError={submitError}
            />
          </CheckoutSection>
        </div>
      </div>
    </main>
  )
}

export default CheckoutPage
