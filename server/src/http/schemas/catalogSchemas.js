import { PLACEMENTS } from '../../domain/entities/Banner.js'
import { NICHES } from '../../domain/entities/Product.js'

/*
 * Formato do que entra (querystring/params) e do que sai (response) nas rotas do catálogo.
 * O Fastify valida a entrada (erro 400 com o motivo) e só envia na resposta os campos listados aqui.
 */

const nullableString = { type: ['string', 'null'] }
const stringList = { type: 'array', items: { type: 'string' } }

export const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    niche: { type: 'string', enum: NICHES },
    category: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number' },
    originalPrice: { type: ['number', 'null'] },
    isFeatured: { type: 'boolean' },
    sizes: stringList,
    colors: stringList,
    fabric: { type: 'string' },
    stock: { type: 'integer' },
    image: nullableString,
  },
}

export const bannerSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    placement: { type: 'string' },
    title: { type: 'string' },
    subtitle: { type: 'string' },
    ctaLabel: { type: 'string' },
    ctaHref: { type: 'string' },
    image: nullableString,
    mobileImage: nullableString,
    showText: { type: 'boolean' },
  },
}

const errorSchema = {
  type: 'object',
  properties: { error: { type: 'string' }, message: { type: 'string' } },
}

export const listProductsSchema = {
  querystring: {
    type: 'object',
    properties: {
      niche: { type: 'string', enum: NICHES },
      featured: { type: 'boolean', default: false },
      onSale: { type: 'boolean', default: false },
    },
    additionalProperties: false,
  },
  response: { 200: { type: 'array', items: productSchema } },
}

export const getProductSchema = {
  params: {
    type: 'object',
    properties: { id: { type: 'string', minLength: 1, maxLength: 120 } },
    required: ['id'],
  },
  response: { 200: productSchema, 404: errorSchema },
}

export const listBannersSchema = {
  querystring: {
    type: 'object',
    properties: { placement: { type: 'string', enum: PLACEMENTS } },
    required: ['placement'],
    additionalProperties: false,
  },
  response: { 200: { type: 'array', items: bannerSchema } },
}
