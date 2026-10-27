import { MAX_QUANTITY } from '../../domain/entities/Cart.js'
import { PAYMENT_METHODS } from '../../domain/services/payment.js'

/*
 * Formato do pedido e do cupom na API. A entrada é conferida aqui (tipos e tamanhos máximos);
 * as regras de negócio (CEP válido, estoque, total...) ficam no domínio e no caso de uso.
 */

const text = (maxLength) => ({ type: 'string', maxLength })
const nullableText = (maxLength) => ({ type: ['string', 'null'], maxLength })
const money = { type: 'number' }

export const couponSchema = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    type: { type: 'string', enum: ['percent', 'fixed'] },
    value: money,
    minSubtotal: money,
    description: { type: 'string' },
  },
}

const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' },
    // Detalhes conforme o erro (ver placeOrder)
    productId: { type: 'string' },
    fields: { type: 'object', additionalProperties: { type: 'string' } },
    total: money,
    minSubtotal: money,
  },
}

export const orderSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    number: { type: 'integer' },
    status: { type: 'string' },
    createdAt: { type: 'string' },
    customer: {
      type: 'object',
      properties: { name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' } },
    },
    address: {
      type: 'object',
      properties: {
        cep: { type: 'string' },
        street: { type: 'string' },
        number: { type: 'string' },
        complement: { type: 'string' },
        neighborhood: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
      },
    },
    couponCode: { type: ['string', 'null'] },
    payment: {
      type: 'object',
      properties: { method: { type: 'string' }, installments: { type: 'integer' }, installmentValue: money },
    },
    delivery: {
      type: 'object',
      properties: { minDays: { type: 'integer' }, maxDays: { type: 'integer' }, service: { type: 'string' } },
    },
    trackingCode: { type: ['string', 'null'] },
    totals: {
      type: 'object',
      properties: { subtotal: money, discount: money, pixDiscount: money, shipping: money, total: money },
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          productName: { type: 'string' },
          productImage: { type: ['string', 'null'] },
          unitPrice: money,
          size: { type: ['string', 'null'] },
          color: { type: ['string', 'null'] },
          quantity: { type: 'integer' },
          lineTotal: money,
        },
      },
    },
  },
}

export const getCouponSchema = {
  params: {
    type: 'object',
    properties: { code: { type: 'string', minLength: 1, maxLength: 40 } },
    required: ['code'],
  },
  response: { 200: couponSchema, 404: errorSchema },
}

export const placeOrderSchema = {
  body: {
    type: 'object',
    required: ['items', 'customer', 'address', 'payment', 'shippingOptionId', 'expectedTotal'],
    properties: {
      items: {
        type: 'array',
        minItems: 1,
        maxItems: 50,
        items: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: text(120),
            size: nullableText(20),
            color: nullableText(40),
            quantity: { type: 'integer', minimum: 1, maximum: MAX_QUANTITY },
          },
        },
      },
      couponCode: nullableText(40),
      customer: {
        type: 'object',
        required: ['name', 'email', 'phone'],
        properties: { name: text(120), email: text(254), phone: text(20) },
      },
      address: {
        type: 'object',
        required: ['cep', 'street', 'number', 'neighborhood', 'city', 'state'],
        properties: {
          cep: text(9),
          street: text(200),
          number: text(20),
          complement: text(100),
          neighborhood: text(100),
          city: text(100),
          state: text(2),
        },
      },
      payment: {
        type: 'object',
        required: ['method'],
        properties: {
          method: { type: 'string', enum: Object.values(PAYMENT_METHODS) },
          installments: { type: 'integer', minimum: 1, default: 1 },
        },
      },
      shippingOptionId: text(40),
      expectedTotal: { type: 'number', minimum: 0 },
    },
  },
  response: { 201: orderSchema, 409: errorSchema, 422: errorSchema, 503: errorSchema },
}

export const quoteShippingSchema = {
  body: {
    type: 'object',
    required: ['cep', 'items'],
    properties: {
      cep: text(9),
      items: {
        type: 'array',
        minItems: 1,
        maxItems: 50,
        items: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: text(120),
            quantity: { type: 'integer', minimum: 1, maximum: MAX_QUANTITY },
          },
        },
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              company: { type: 'string' },
              price: money,
              minDays: { type: 'integer' },
              maxDays: { type: 'integer' },
            },
          },
        },
      },
    },
    422: errorSchema,
    503: errorSchema,
  },
}
