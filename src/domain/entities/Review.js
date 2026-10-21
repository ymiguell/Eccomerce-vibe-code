/**
 * Avaliação de um produto feita por um cliente. Entidade pura.
 */
export const MIN_RATING = 1
export const MAX_RATING = 5
export const MIN_COMMENT_LENGTH = 10
export const MAX_COMMENT_LENGTH = 1000

/**
 * Valida os dados digitados no formulário.
 * Retorna um objeto { campo: mensagem } — vazio quando está tudo certo.
 */
export function validateReviewInput({ author = '', rating = 0, comment = '' }) {
  const errors = {}

  if (author.trim().length < 2) errors.author = 'Informe seu nome (mínimo de 2 letras).'

  if (!Number.isInteger(rating) || rating < MIN_RATING || rating > MAX_RATING) {
    errors.rating = 'Escolha uma nota de 1 a 5 estrelas.'
  }

  const length = comment.trim().length
  if (length < MIN_COMMENT_LENGTH) errors.comment = `Escreva pelo menos ${MIN_COMMENT_LENGTH} caracteres.`
  if (length > MAX_COMMENT_LENGTH) errors.comment = `Use no máximo ${MAX_COMMENT_LENGTH} caracteres.`

  return errors
}

export function createReview({ id, productId, author, rating, comment, date, verifiedPurchase = false }) {
  const errors = validateReviewInput({ author, rating, comment })
  if (!id || !productId || !date || Object.keys(errors).length > 0) {
    throw new Error(`Avaliação inválida (${id}): ${Object.values(errors).join(' ')}`)
  }

  return Object.freeze({
    id,
    productId,
    author: author.trim(),
    rating,
    comment: comment.trim(),
    date,
    verifiedPurchase,
  })
}

/** Média (1 casa decimal), total e quantas avaliações há de cada nota (5 → 1). */
export function summarizeRatings(reviews) {
  const count = reviews.length
  const sum = reviews.reduce((total, review) => total + review.rating, 0)
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((review) => review.rating === stars).length,
  }))

  return { count, average: count ? Math.round((sum / count) * 10) / 10 : 0, distribution }
}
