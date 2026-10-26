import { validateReviewInput } from '../../domain/entities/Review.js'

/**
 * Caso de uso: publicar uma avaliação. A data e o id são definidos pelo servidor.
 * Retorna { review }, { errors: { campo: mensagem } } ou { error: 'product_not_found' }.
 */
export function makeSubmitReview({ productRepository, reviewRepository }) {
  return async function submitReview(productId, input) {
    const errors = validateReviewInput(input)
    if (Object.keys(errors).length > 0) return { errors }

    if (!(await productRepository.findById(productId))) return { error: 'product_not_found' }

    const review = await reviewRepository.create({
      productId,
      author: input.author.trim(),
      rating: input.rating,
      comment: input.comment.trim(),
    })
    return { review }
  }
}
