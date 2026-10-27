import { COUPON_TYPES } from '../../domain/entities/Coupon.js'
import { ORDER_STATUSES } from '../../domain/entities/Order.js'
import { MAX_PRICE } from '../../domain/entities/Product.js'
import { productSchema } from './catalogSchemas.js'
import { couponSchema, orderSchema } from './orderSchemas.js'

/*
 * Painel da loja (/admin). A entrada é conferida aqui (tipos e tamanhos);
 * as regras (para onde o pedido pode ir, preço original maior que o preço...) ficam no domínio.
 */

const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' },
    fields: { type: 'object', additionalProperties: { type: 'string' } },
  },
}
const errors = { 401: errorSchema, 403: errorSchema }

const money = { type: 'number', minimum: 0, maximum: MAX_PRICE }

export const listOrdersSchema = {
  querystring: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ORDER_STATUSES },
      page: { type: 'integer', minimum: 1, maximum: 10_000, default: 1 },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        orders: { type: 'array', items: orderSchema },
        total: { type: 'integer' },
        page: { type: 'integer' },
        pageSize: { type: 'integer' },
        counts: { type: 'object', additionalProperties: { type: 'integer' } },
      },
    },
    ...errors,
  },
}

// :id de pedido ou avaliação (uuid)
const orderParams = {
  type: 'object',
  properties: { id: { type: 'string', minLength: 1, maxLength: 64 } },
  required: ['id'],
}
// Opcional ao marcar como enviado; null apaga (o formato é conferido no domínio)
const trackingCode = { type: ['string', 'null'], maxLength: 60 }

export const changeOrderStatusSchema = {
  params: orderParams,
  body: {
    type: 'object',
    required: ['status'],
    properties: { status: { type: 'string', enum: ORDER_STATUSES }, trackingCode },
    additionalProperties: false,
  },
  response: { 200: orderSchema, 404: errorSchema, 409: errorSchema, 422: errorSchema, ...errors },
}

export const setTrackingCodeSchema = {
  params: orderParams,
  body: {
    type: 'object',
    required: ['trackingCode'],
    properties: { trackingCode },
    additionalProperties: false,
  },
  response: { 200: orderSchema, 404: errorSchema, 422: errorSchema, ...errors },
}

export const updateProductSchema = {
  params: {
    type: 'object',
    properties: { id: { type: 'string', minLength: 1, maxLength: 120 } },
    required: ['id'],
  },
  body: {
    type: 'object',
    minProperties: 1,
    properties: {
      price: money,
      // null tira a promoção. Não usar anyOf: o Fastify converteria o null em 0 no primeiro ramo
      originalPrice: { ...money, type: ['number', 'null'] },
      stock: { type: 'integer', minimum: 0, maximum: 1_000_000 },
      isFeatured: { type: 'boolean' },
    },
    additionalProperties: false,
  },
  response: { 200: productSchema, 404: errorSchema, 422: errorSchema, ...errors },
}

const adminCouponSchema = {
  type: 'object',
  properties: {
    ...couponSchema.properties,
    active: { type: 'boolean' },
    createdAt: { type: 'string' },
    timesUsed: { type: 'integer' },
  },
}

export const listCouponsSchema = {
  response: { 200: { type: 'array', items: adminCouponSchema }, ...errors },
}

export const createCouponSchema = {
  body: {
    type: 'object',
    required: ['code', 'type', 'value'],
    properties: {
      code: { type: 'string', maxLength: 40 },
      type: { type: 'string', enum: COUPON_TYPES },
      value: money,
      minSubtotal: money,
      description: { type: 'string', maxLength: 200 },
    },
    additionalProperties: false,
  },
  response: { 201: adminCouponSchema, 409: errorSchema, 422: errorSchema, ...errors },
}

export const setCouponActiveSchema = {
  params: {
    type: 'object',
    properties: { code: { type: 'string', minLength: 1, maxLength: 40 } },
    required: ['code'],
  },
  body: {
    type: 'object',
    required: ['active'],
    properties: { active: { type: 'boolean' } },
    additionalProperties: false,
  },
  response: { 200: adminCouponSchema, 404: errorSchema, ...errors },
}

const adminReviewSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    productId: { type: 'string' },
    productName: { type: 'string' },
    author: { type: 'string' },
    rating: { type: 'integer' },
    comment: { type: 'string' },
    date: { type: 'string' },
    verifiedPurchase: { type: 'boolean' },
    hidden: { type: 'boolean' },
  },
}

export const listReviewsSchema = {
  querystring: {
    type: 'object',
    properties: {
      visibility: { type: 'string', enum: ['visible', 'hidden'] },
      page: { type: 'integer', minimum: 1, maximum: 10_000, default: 1 },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        reviews: { type: 'array', items: adminReviewSchema },
        total: { type: 'integer' },
        page: { type: 'integer' },
        pageSize: { type: 'integer' },
        counts: { type: 'object', properties: { visible: { type: 'integer' }, hidden: { type: 'integer' } } },
      },
    },
    ...errors,
  },
}

export const setReviewHiddenSchema = {
  params: orderParams,
  body: {
    type: 'object',
    required: ['hidden'],
    properties: { hidden: { type: 'boolean' } },
    additionalProperties: false,
  },
  response: { 200: adminReviewSchema, 404: errorSchema, ...errors },
}

export const listSubscribersSchema = {
  response: {
    200: {
      type: 'array',
      items: { type: 'object', properties: { email: { type: 'string' }, createdAt: { type: 'string' } } },
    },
    ...errors,
  },
}

export const removeSubscriberSchema = {
  params: {
    type: 'object',
    properties: { email: { type: 'string', minLength: 3, maxLength: 254 } },
    required: ['email'],
  },
  response: { 404: errorSchema, ...errors },
}
