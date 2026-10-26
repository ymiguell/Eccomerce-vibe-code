import { createReview } from '../../domain/entities/Review.js'

/*
 * Avaliações de exemplo. Em vez de escrever à mão para cada produto, cada produto recebe
 * de 0 a 8 avaliações deste conjunto, escolhidas a partir do id (sempre as mesmas para o mesmo produto).
 * Usado quando o site roda sem a API. As enviadas pelo formulário ficam só em memória até a página ser recarregada.
 * Com a API, as avaliações vêm do banco (server/prisma/seed/reviews.json foi gerado a partir deste arquivo).
 */
const SAMPLE_REVIEWS = [
  { author: 'Mariana S.', rating: 5, comment: 'Chegou antes do prazo e muito bem embalado. Superou minhas expectativas!' },
  { author: 'Carlos E.', rating: 5, comment: 'Excelente qualidade pelo preço. Já é a segunda vez que compro na Montreal.' },
  { author: 'Juliana P.', rating: 4, comment: 'Gostei bastante, só achei que a cor é um pouco diferente da foto.' },
  { author: 'Rafael M.', rating: 5, comment: 'Produto exatamente como descrito. Recomendo!' },
  { author: 'Patrícia L.', rating: 4, comment: 'Bom custo-benefício. A entrega levou um dia a mais, mas valeu a pena.' },
  { author: 'Lucas R.', rating: 3, comment: 'Atende ao que promete, mas esperava um acabamento um pouco melhor.' },
  { author: 'Fernanda A.', rating: 5, comment: 'Comprei para dar de presente e a pessoa amou. Atendimento nota 10.' },
  { author: 'Bruno C.', rating: 4, comment: 'Muito bom! Usei o cupom de primeira compra e saiu ainda mais em conta.' },
  { author: 'Aline G.', rating: 5, comment: 'Qualidade ótima, confortável e bonito. Vou comprar mais.' },
  { author: 'Thiago N.', rating: 2, comment: 'Precisei trocar o tamanho, mas a troca foi rápida e sem custo.' },
  { author: 'Camila F.', rating: 5, comment: 'Simplesmente perfeito. Chegou tudo certinho e bem protegido.' },
  { author: 'Diego V.', rating: 4, comment: 'Gostei muito. O site mostra o prazo certinho e chegou no dia previsto.' },
]

// Número estável a partir do texto do id (mesmo produto → mesmas avaliações)
function hashOf(text) {
  return [...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7)
}

function sampleReviewsFor(productId) {
  const hash = hashOf(productId)
  const count = hash % 9

  return Array.from({ length: count }, (_, index) => {
    const sample = SAMPLE_REVIEWS[(hash + index * 5) % SAMPLE_REVIEWS.length]
    const day = String(((hash >>> (index + 1)) % 28) + 1).padStart(2, '0')
    const month = String(((hash + index) % 9) + 1).padStart(2, '0')

    return createReview({
      ...sample,
      id: `${productId}-review-${index}`,
      productId,
      date: `2026-${month}-${day}`,
      verifiedPurchase: index % 3 !== 2,
    })
  })
}

export class MockReviewRepository {
  #submitted = []

  async getByProduct(productId) {
    return [...sampleReviewsFor(productId), ...this.#submitted.filter((review) => review.productId === productId)]
  }

  /** Imita a API: define id e data e devolve { review }. */
  async create(productId, input) {
    const review = createReview({
      ...input,
      id: crypto.randomUUID(),
      productId,
      date: new Date().toISOString().slice(0, 10),
    })
    this.#submitted.push(review)
    return { review }
  }
}
