import { MAX_PASSWORD_LENGTH } from '../../domain/entities/Account.js'
import { orderSchema } from './orderSchemas.js'

/*
 * Contas: cadastro, login e "Minha conta". A entrada é conferida aqui (tipos e tamanhos);
 * as regras (senha com letras e números, nome completo...) ficam no domínio (Account.js).
 * A resposta nunca inclui o hash da senha: só os campos listados em customerSchema.
 */

const customerSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    // true só para a equipe da loja (o site mostra o link do painel)
    isAdmin: { type: 'boolean' },
    createdAt: { type: 'string' },
  },
}

const sessionSchema = {
  type: 'object',
  properties: { customer: customerSchema, token: { type: 'string' } },
}

const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' },
    fields: { type: 'object', additionalProperties: { type: 'string' } },
  },
}

const email = { type: 'string', maxLength: 254 }
const password = { type: 'string', maxLength: MAX_PASSWORD_LENGTH }

export const registerSchema = {
  body: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: { name: { type: 'string', maxLength: 120 }, email, password },
  },
  response: { 201: sessionSchema, 409: errorSchema, 422: errorSchema },
}

export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: { email, password },
  },
  response: { 200: sessionSchema, 401: errorSchema },
}

export const meSchema = {
  response: { 200: customerSchema, 401: errorSchema },
}

export const updateMeSchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: { name: { type: 'string', maxLength: 120 }, phone: { type: 'string', maxLength: 20 } },
  },
  response: { 200: customerSchema, 401: errorSchema, 422: errorSchema },
}

export const myOrdersSchema = {
  response: { 200: { type: 'array', items: orderSchema }, 401: errorSchema },
}
