import { createReview, validateReviewInput } from '../../domain/entities/Review.js'

/**
 * Caso de uso: publicar uma avaliação.
 * Retorna { review } quando deu certo ou { errors: { campo: mensagem } } quando há dados inválidos.
 */
export function makeSubmitReview(reviewRepository, { now = () => new Date(), createId = () => crypto.randomUUID() } = {}) {
  return async function submitReview(productId, input) {
    const errors = validateReviewInput(input)
    if (Object.keys(errors).length > 0) return { errors }

    const review = createReview({
      ...input,
      id: createId(),
      productId,
      date: now().toISOString().slice(0, 10),
    })

    await reviewRepository.save(review)
    return { review }
  }
}
