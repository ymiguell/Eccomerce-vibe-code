import { validateReviewInput } from '../../domain/entities/Review.js'

/**
 * Caso de uso: publicar uma avaliação.
 * Confere os campos antes de enviar (resposta rápida); id e data são definidos por quem grava (API ou mock).
 * Retorna { review }, { errors: { campo: mensagem } } ou { error: código } (ex.: sem conexão).
 */
export function makeSubmitReview(reviewRepository) {
  return async function submitReview(productId, input) {
    const errors = validateReviewInput(input)
    if (Object.keys(errors).length > 0) return { errors }

    return reviewRepository.create(productId, input)
  }
}
