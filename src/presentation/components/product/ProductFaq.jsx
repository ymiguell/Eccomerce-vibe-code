import { useId } from 'react'
import { MAX_INSTALLMENTS, PIX_DISCOUNT_PERCENT } from '../../../domain/services/payment.js'
import { FREE_SHIPPING_THRESHOLD, POSTING_DAYS } from '../../../domain/services/shipping.js'
import { formatPrice } from '../../formatters/currency.js'

// Perguntas e respostas. Os números vêm das regras do domínio, então mudam junto com elas.
const questions = [
  {
    question: 'Qual é o prazo de entrega?',
    answer: `Pagamentos via Pix e cartão são confirmados na hora. O pedido é separado e postado em até ${POSTING_DAYS} dias úteis. Depois do envio, o prazo médio de transporte é: Sudeste, 2 a 5 dias úteis; Sul, 3 a 7; Centro-Oeste, 3 a 8; Nordeste, 5 a 12; Norte, 7 a 15. Para ver o prazo exato do seu endereço, use "Quando chega na sua casa?" nesta página.`,
    icon: (
      <>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
        <circle cx="7" cy="17.5" r="1.5" />
        <circle cx="17.5" cy="17.5" r="1.5" />
      </>
    ),
  },
  {
    question: 'Como acompanho o meu pedido?',
    answer: 'Assim que o pedido é postado, você recebe por e-mail e WhatsApp o código de rastreio e o link para acompanhar a entrega em tempo real.',
    icon: (
      <>
        <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </>
    ),
  },
  {
    question: 'Quando o frete é gratuito?',
    answer: `O frete é grátis para todo o Brasil em compras a partir de ${formatPrice(FREE_SHIPPING_THRESHOLD)}, em qualquer forma de pagamento.`,
    icon: (
      <>
        <path d="M3 12V4h8l10 10-8 8L3 12z" />
        <circle cx="7.5" cy="8.5" r="1.25" />
      </>
    ),
  },
  {
    question: 'Como funciona a troca?',
    answer: 'A primeira troca é grátis em até 30 dias após o recebimento. Basta solicitar na área "Meus pedidos": enviamos uma etiqueta de postagem e, quando o produto chega, despachamos o novo.',
    icon: <path d="M4 7h13l-3-3M20 17H7l3 3" />,
  },
  {
    question: 'Comprei o tamanho errado. Como proceder?',
    answer: 'Sem problema: solicite a troca pelo tamanho certo em "Meus pedidos". Confira também o guia de tamanhos antes de escolher; ele fica disponível nas peças de roupa e calçados.',
    icon: <path d="M3 17L17 3l4 4L7 21H3v-4zM14 6l4 4" />,
  },
  {
    question: 'Quais são as formas de pagamento?',
    answer: `Pix, com ${PIX_DISCOUNT_PERCENT}% de desconto; cartão de crédito em até ${MAX_INSTALLMENTS}x sem juros; e boleto bancário. O cartão Montreal tem condições especiais.`,
    icon: (
      <>
        <rect x="3" y="5.5" width="18" height="13" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
  },
]

/** "Dúvidas Frequentes": uma pergunta aberta por vez (atributo `name` do <details>). */
function ProductFaq() {
  const groupName = useId()

  return (
    <section aria-labelledby="faq-title" className="mx-auto mt-20 max-w-3xl">
      <h2 id="faq-title" className="text-center text-3xl font-semibold sm:text-4xl">
        Dúvidas Frequentes
      </h2>

      <div className="mt-8 space-y-3">
        {questions.map((item, index) => (
          <details
            key={item.question}
            name={groupName}
            open={index === 0}
            className="group rounded-sm border border-border bg-surface transition-shadow duration-200 open:border-primary open:shadow-md"
          >
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 px-4 py-3 font-semibold sm:px-5 [&::-webkit-details-marker]:hidden">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-muted text-foreground transition-colors duration-200 group-open:bg-primary group-open:text-on-primary">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {item.icon}
                </svg>
              </span>
              <span className="flex-1">{item.question}</span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-200 group-open:rotate-180 group-open:border-primary group-open:bg-primary group-open:text-on-primary">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </summary>
            <p className="px-4 pb-5 leading-relaxed text-muted-foreground sm:pr-16 sm:pl-[4.75rem]">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export default ProductFaq
