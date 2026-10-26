import { MAX_COMMENT_LENGTH, MAX_RATING, MIN_RATING } from '../../domain/entities/Review.js'

/*
 * Avaliações e newsletter. A entrada é conferida aqui (tipos e tamanhos);
 * as regras (nome com 2+ letras, comentário com 10+ caracteres, e-mail válido) ficam no domínio.
 */

const reviewSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    productId: { type: 'string' },
    author: { type: 'string' },
    rating: { type: 'integer' },
    comment: { type: 'string' },
    date: { type: 'string' },
    verifiedPurchase: { type: 'boolean' },
  },
}

const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' },
    fields: { type: 'object', additionalProperties: { type: 'string' } },
  },
}

const productParams = {
  type: 'object',
  properties: { id: { type: 'string', minLength: 1, maxLength: 120 } },
  required: ['id'],
}

export const listReviewsSchema = {
  params: productParams,
  response: { 200: { type: 'array', items: reviewSchema } },
}

export const submitReviewSchema = {
  params: productParams,
  body: {
    type: 'object',
    required: ['author', 'rating', 'comment'],
    properties: {
      author: { type: 'string', maxLength: 80 },
      rating: { type: 'integer', minimum: MIN_RATING, maximum: MAX_RATING },
      // Folga sobre o limite do domínio: espaços nas pontas são removidos antes de contar
      comment: { type: 'string', maxLength: MAX_COMMENT_LENGTH + 100 },
    },
  },
  response: { 201: reviewSchema, 404: errorSchema, 422: errorSchema },
}

export const subscribeSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: { email: { type: 'string', maxLength: 254 } },
  },
  response: {
    201: { type: 'object', properties: { ok: { type: 'boolean' } } },
    409: errorSchema,
    422: errorSchema,
  },
}
