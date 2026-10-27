import { MAX_INSTALLMENTS, MIN_INSTALLMENT_VALUE, PIX_DISCOUNT_PERCENT } from '../../domain/services/payment.js'
import { FREE_SHIPPING_THRESHOLD, POSTING_DAYS, SHIPPING_FEE, getDeliveryWindows } from '../../domain/services/shipping.js'
import { formatPrice } from '../formatters/currency.js'
import { formatPhone } from '../formatters/masks.js'
import { STORE } from './storeInfo.js'

/*
 * Páginas do rodapé (institucional e ajuda). Cada página: endereço (slug), título, resumo e seções.
 * Uma seção pode ter `paragraphs`, `list`, `table` ou `faq` (perguntas que abrem e fecham).
 * Valores de frete e pagamento vêm das regras do domínio: se a regra mudar, o texto acompanha.
 * Os textos legais (privacidade, termos, trocas) são um modelo: revise com um advogado antes de abrir a loja.
 */

const deliveryWindows = getDeliveryWindows()
const fastest = Math.min(...deliveryWindows.map((window) => window.minDays))
const slowest = Math.max(...deliveryWindows.map((window) => window.maxDays))

const contactLine =`Fale com a gente pelo e-mail ${STORE.email}, pelo WhatsApp ${formatPhone(STORE.whatsapp)} ou pelo telefone ${formatPhone(STORE.phone)}.`

export const INFO_GROUPS = Object.freeze({ institucional: 'Institucional', ajuda: 'Ajuda' })

export const INFO_PAGES = Object.freeze([
  {
    slug: 'sobre-nos',
    group: 'institucional',
    title: 'Sobre nós',
    summary: 'Uma loja de moda e casa feita para o dia a dia, com peças que duram.',
    sections: [
      {
        paragraphs: [
          `A ${STORE.name} nasceu para reunir em um só lugar roupas, itens para a casa, tecnologia e cuidados pessoais escolhidos com atenção: produtos versáteis, confortáveis e feitos para durar.`,
          'Selecionamos cada peça pensando em quem compra: preço justo, informação clara sobre tamanho e material, entrega acompanhada do começo ao fim e atendimento de gente de verdade.',
        ],
      },
      {
        heading: 'O que você encontra aqui',
        list: [
          'Moda feminina, masculina e infantil, do básico ao especial.',
          'Cama, mesa, banho e utilidades para deixar a casa do seu jeito.',
          'Tecnologia e eletroportáteis para facilitar a rotina.',
          'Saúde e bem-estar.',
        ],
      },
    ],
  },
  {
    slug: 'nossos-objetivos',
    group: 'institucional',
    title: 'Nossos objetivos',
    summary: 'O que guia as nossas escolhas.',
    sections: [
      {
        list: [
          'Qualidade que dura: preferimos menos peças, melhores, a coleções descartáveis.',
          'Transparência: preço, frete, prazo e condições de troca claros antes da compra.',
          'Parcerias responsáveis com fornecedores que respeitam pessoas e o meio ambiente.',
          'Atendimento que resolve: quem fala com a gente recebe resposta, não um protocolo esquecido.',
        ],
      },
    ],
  },
  {
    slug: 'trabalhe-conosco',
    group: 'institucional',
    title: 'Trabalhe conosco',
    summary: 'Quer fazer parte do time? Mande seu currículo.',
    sections: [
      {
        paragraphs: [
          `Envie seu currículo para ${STORE.email} com o assunto "Trabalhe conosco" e a área de interesse (atendimento, logística, marketing, tecnologia ou loja).`,
          'Guardamos os currículos por até 6 meses para novas vagas. Depois disso, apagamos — veja a nossa Política de privacidade.',
        ],
      },
    ],
  },
  {
    slug: 'politica-de-privacidade',
    group: 'institucional',
    title: 'Política de privacidade',
    summary: 'Quais dados coletamos, para quê e como você pode controlá-los (LGPD).',
    sections: [
      {
        paragraphs: [
          `Esta política explica como a ${STORE.legalName} (CNPJ ${STORE.cnpj}) trata os seus dados pessoais, de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).`,
        ],
      },
      {
        heading: 'Dados que coletamos',
        list: [
          'Na compra: nome, e-mail, celular e endereço de entrega.',
          'Na conta: nome, e-mail, celular e uma senha guardada de forma protegida (nunca em texto).',
          'Na newsletter: apenas o e-mail.',
          'Nas avaliações: o nome que você escolher mostrar e o seu comentário.',
          'Dados de cartão não passam pela loja: são digitados e processados pelo meio de pagamento.',
        ],
      },
      {
        heading: 'Para que usamos',
        list: [
          'Processar, entregar e dar suporte aos seus pedidos.',
          'Manter a sua conta e mostrar o histórico de pedidos.',
          'Enviar novidades e ofertas, só se você se inscrever na newsletter.',
          'Cumprir obrigações legais, como a emissão de nota fiscal.',
        ],
      },
      {
        heading: 'Com quem compartilhamos',
        paragraphs: [
          'Só com quem precisa para o pedido acontecer: transportadoras (nome e endereço) e o meio de pagamento. Não vendemos nem alugamos os seus dados.',
        ],
      },
      {
        heading: 'Armazenamento no seu navegador',
        paragraphs: [
          'A sacola e o login ficam guardados no seu navegador para você não perder o que escolheu nem precisar entrar de novo a cada visita. Não usamos cookies de publicidade.',
        ],
      },
      {
        heading: 'Seus direitos',
        paragraphs: [
          `Você pode pedir, a qualquer momento, acesso, correção ou exclusão dos seus dados, e sair da newsletter. ${contactLine}`,
        ],
      },
    ],
  },
  {
    slug: 'termos-de-uso',
    group: 'institucional',
    title: 'Termos de uso',
    summary: 'As regras para comprar e usar o site.',
    sections: [
      {
        heading: 'Preços e disponibilidade',
        paragraphs: [
          'Os preços e o estoque podem mudar sem aviso. O valor que vale é o confirmado no fechamento do pedido; se algo mudar enquanto você finaliza a compra, avisamos antes de concluir.',
        ],
      },
      {
        heading: 'Cupons',
        paragraphs: [
          'Os cupons valem enquanto estiverem ativos, um por pedido, e podem exigir um valor mínimo de compra. Não são cumulativos nem trocados por dinheiro.',
        ],
      },
      {
        heading: 'Conta',
        paragraphs: [
          'Você é responsável por manter a sua senha em segredo. Se suspeitar de uso indevido, troque a senha e fale com a gente.',
        ],
      },
      {
        heading: 'Avaliações',
        paragraphs: [
          'Avaliações com ofensas, dados pessoais de terceiros, propaganda ou conteúdo que não tenha relação com o produto podem ser ocultadas.',
        ],
      },
      { heading: 'Contato', paragraphs: [contactLine] },
    ],
  },
  {
    slug: 'trocas-e-devolucoes',
    group: 'ajuda',
    title: 'Trocas e devoluções',
    summary: '7 dias para desistir da compra e 30 dias para trocar.',
    sections: [
      {
        heading: 'Desistência (arrependimento)',
        paragraphs: [
          'Pelo Código de Defesa do Consumidor, você pode desistir da compra em até 7 dias corridos depois de receber o pedido, sem precisar explicar o motivo. Devolvemos o valor integral, incluindo o frete.',
        ],
      },
      {
        heading: 'Troca de tamanho ou cor',
        paragraphs: [
          'Você tem até 30 dias corridos depois do recebimento para trocar por outro tamanho ou cor, sujeito ao estoque. A primeira troca tem frete por nossa conta.',
        ],
      },
      {
        heading: 'Produto com defeito',
        paragraphs: [
          'Produtos com defeito podem ser devolvidos em até 30 dias (produtos não duráveis) ou 90 dias (duráveis, como eletrônicos e eletroportáteis). Trocamos, consertamos ou devolvemos o valor.',
        ],
      },
      {
        heading: 'Como pedir',
        list: [
          `Fale com o atendimento informando o número do pedido (${STORE.email}).`,
          'Embale o produto, de preferência na embalagem original, com etiquetas e acessórios.',
          'Enviamos as instruções de postagem. O reembolso sai em até 10 dias úteis depois que o produto chega: no Pix, na conta de origem; no cartão, como estorno na fatura.',
        ],
      },
      {
        heading: 'Não aceitamos troca de',
        list: ['Peças usadas, lavadas ou sem etiqueta.', 'Itens de higiene pessoal com a embalagem aberta.'],
      },
    ],
  },
  {
    slug: 'prazos-de-entrega',
    group: 'ajuda',
    title: 'Prazos de entrega',
    summary: `Frete grátis acima de ${formatPrice(FREE_SHIPPING_THRESHOLD)} para todo o Brasil.`,
    sections: [
      {
        heading: 'Valor do frete',
        paragraphs: [
          `Compras a partir de ${formatPrice(FREE_SHIPPING_THRESHOLD)} têm frete grátis. Abaixo disso, o frete é ${formatPrice(SHIPPING_FEE)} para qualquer região.`,
        ],
      },
      {
        heading: 'Prazo por região',
        paragraphs: [
          `O prazo conta em dias úteis a partir da confirmação do pagamento e já inclui até ${POSTING_DAYS} dias úteis para separar e postar o pedido. Você vê o prazo exato do seu CEP na página do produto e no checkout.`,
        ],
        table: {
          caption: 'Prazo estimado de entrega por região',
          columns: ['Região', 'Prazo (dias úteis)'],
          rows: deliveryWindows.map(({ region, minDays, maxDays }) => [region, `${minDays} a ${maxDays}`]),
        },
      },
      {
        heading: 'Acompanhamento',
        paragraphs: [
          'Quando o pedido sai para entrega, o código de rastreio aparece em "Minha conta", no detalhe do pedido.',
        ],
      },
    ],
  },
  {
    slug: 'formas-de-pagamento',
    group: 'ajuda',
    title: 'Formas de pagamento',
    summary: `Pix com ${PIX_DISCOUNT_PERCENT}% de desconto ou cartão em até ${MAX_INSTALLMENTS}x sem juros.`,
    sections: [
      {
        heading: 'Pix',
        paragraphs: [
          `Pagando no Pix você ganha ${PIX_DISCOUNT_PERCENT}% de desconto nos produtos (já com o cupom, se houver). A aprovação é imediata.`,
        ],
      },
      {
        heading: 'Cartão de crédito',
        paragraphs: [
          `Parcele em até ${MAX_INSTALLMENTS}x sem juros, com parcela mínima de ${formatPrice(MIN_INSTALLMENT_VALUE)}. Aceitamos Visa, Mastercard, Elo e American Express.`,
        ],
      },
      {
        heading: 'Segurança',
        paragraphs: ['Os dados do cartão são processados pelo meio de pagamento e não ficam guardados na loja.'],
      },
    ],
  },
  {
    slug: 'guia-de-tamanhos',
    group: 'ajuda',
    title: 'Guia de tamanhos',
    summary: 'Medidas de referência em centímetros. Na dúvida entre dois tamanhos, escolha o maior.',
    sections: [
      {
        heading: 'Blusas, camisetas e vestidos',
        table: {
          caption: 'Medidas do corpo para peças de cima (cm)',
          columns: ['Tamanho', 'Busto', 'Cintura', 'Quadril'],
          rows: [
            ['P', '86–90', '70–74', '94–98'],
            ['M', '94–98', '78–82', '102–106'],
            ['G', '102–106', '86–90', '110–114'],
            ['GG', '110–114', '94–98', '118–122'],
          ],
        },
      },
      {
        heading: 'Calças e bermudas (numeração)',
        table: {
          caption: 'Medidas do corpo para calças (cm)',
          columns: ['Número', 'Cintura', 'Quadril'],
          rows: [
            ['38', '72–75', '92–95'],
            ['40', '76–79', '96–99'],
            ['42', '80–83', '100–103'],
            ['44', '84–87', '104–107'],
            ['46', '88–91', '108–111'],
          ],
        },
      },
      {
        heading: 'Infantil',
        table: {
          caption: 'Altura da criança por tamanho (cm)',
          columns: ['Tamanho', 'Altura'],
          rows: [
            ['4', '99–106'],
            ['6', '111–118'],
            ['8', '123–130'],
            ['10', '135–142'],
            ['12', '143–150'],
            ['14', '151–157'],
            ['16', '158–164'],
          ],
        },
      },
      {
        heading: 'Calçados',
        paragraphs: ['Meça o pé do calcanhar até a ponta do dedo maior, no fim do dia, em pé.'],
        table: {
          caption: 'Comprimento do pé por número (cm)',
          columns: ['Número', 'Comprimento do pé'],
          rows: [
            ['35', '23,0'],
            ['36', '23,7'],
            ['37', '24,3'],
            ['38', '25,0'],
            ['39', '25,7'],
            ['40', '26,3'],
            ['41', '27,0'],
            ['42', '27,7'],
            ['43', '28,3'],
            ['44', '29,0'],
          ],
        },
      },
    ],
  },
  {
    slug: 'perguntas-frequentes',
    group: 'ajuda',
    title: 'Perguntas frequentes',
    summary: 'Respostas rápidas sobre pedidos, pagamento, entrega e trocas.',
    sections: [
      {
        faq: [
          {
            question: 'Preciso criar uma conta para comprar?',
            answer:
              'Não. Mas com a conta você acompanha os pedidos em "Minha conta" e o checkout já vem preenchido nas próximas compras.',
          },
          {
            question: 'Como acompanho meu pedido?',
            answer:
              'Em "Minha conta" aparecem a situação de cada pedido e, depois do envio, o código de rastreio. Comprou sem conta? Fale com o atendimento com o número do pedido.',
          },
          {
            question: 'Qual o prazo de entrega?',
            answer: `Depende da região, de ${fastest} a ${slowest} dias úteis. O prazo exato do seu CEP aparece na página do produto e no checkout.`,
          },
          {
            question: 'Quando o frete é grátis?',
            answer: `Em compras a partir de ${formatPrice(FREE_SHIPPING_THRESHOLD)}, para todo o Brasil.`,
          },
          {
            question: 'Tem desconto no Pix?',
            answer: `Sim, ${PIX_DISCOUNT_PERCENT}% nos produtos, somado ao cupom.`,
          },
          {
            question: 'Em quantas vezes posso parcelar?',
            answer: `Em até ${MAX_INSTALLMENTS}x sem juros no cartão de crédito, com parcela mínima de ${formatPrice(MIN_INSTALLMENT_VALUE)}.`,
          },
          {
            question: 'Posso usar mais de um cupom?',
            answer: 'Não, é um cupom por pedido.',
          },
          {
            question: 'O tamanho não serviu. E agora?',
            answer:
              'Você tem 30 dias para trocar, e a primeira troca é por nossa conta. Veja o passo a passo em Trocas e devoluções.',
          },
        ],
      },
      { heading: 'Não achou sua resposta?', paragraphs: [contactLine] },
    ],
  },
])

export function findInfoPage(slug) {
  return INFO_PAGES.find((page) => page.slug === slug) ?? null
}
