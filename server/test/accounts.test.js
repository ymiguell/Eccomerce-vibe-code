import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { makeAuthenticate } from '../src/application/useCases/authenticate.js'
import { makeListCustomerOrders } from '../src/application/useCases/listCustomerOrders.js'
import { makeLoginCustomer } from '../src/application/useCases/loginCustomer.js'
import { makeLogoutCustomer } from '../src/application/useCases/logoutCustomer.js'
import { makeRegisterCustomer } from '../src/application/useCases/registerCustomer.js'
import { makeUpdateProfile } from '../src/application/useCases/updateProfile.js'
import { buildApp } from '../src/http/app.js'
import { ScryptPasswordHasher } from '../src/infrastructure/security/ScryptPasswordHasher.js'
import { generateSessionToken } from '../src/infrastructure/security/sessionTokens.js'

// Repositórios em memória (sem PostgreSQL); a proteção da senha é a de verdade (scrypt)
let customers
let sessions
let orders
let placedWith

const publicData = ({ passwordHash: _passwordHash, ...customer }) => customer

const customerRepository = {
  emailExists: async (email) => customers.some((customer) => customer.email === email),
  findCredentialsByEmail: async (email) => {
    const found = customers.find((customer) => customer.email === email)
    return found ? { customer: publicData(found), passwordHash: found.passwordHash } : null
  },
  create: async (data) => {
    const customer = { id: `c${customers.length + 1}`, phone: '', createdAt: '2026-10-26T12:00:00.000Z', ...data }
    customers.push(customer)
    return publicData(customer)
  },
  update: async (id, data) => {
    const customer = customers.find((item) => item.id === id)
    Object.assign(customer, data)
    return publicData(customer)
  },
}
const sessionRepository = {
  create: async (customerId) => {
    const token = generateSessionToken()
    sessions.set(token, customerId)
    return token
  },
  findCustomerByToken: async (token) => {
    const customer = customers.find((item) => item.id === sessions.get(token))
    return customer ? publicData(customer) : null
  },
  delete: async (token) => sessions.delete(token),
}
const passwordHasher = new ScryptPasswordHasher()
const accounts = { customerRepository, sessionRepository, passwordHasher }

const app = await buildApp({
  corsOrigins: [],
  logger: false,
  rateLimits: false,
  useCases: {
    checkHealth: async () => ({}),
    authenticate: makeAuthenticate(sessionRepository),
    registerCustomer: makeRegisterCustomer(accounts),
    loginCustomer: makeLoginCustomer(accounts),
    logoutCustomer: makeLogoutCustomer(sessionRepository),
    updateProfile: makeUpdateProfile(customerRepository),
    listCustomerOrders: makeListCustomerOrders({
      findByCustomer: async (customerId) => orders.filter((order) => order.customerId === customerId),
    }),
    // Pedido falso: só registra com qual conta foi feito
    placeOrder: async (input) => {
      placedWith = input.customerId
      return { order: { id: 'o1', number: 1, customerId: input.customerId } }
    },
  },
})

beforeEach(() => {
  customers = []
  sessions = new Map()
  orders = []
  placedWith = undefined
})

const call = async (method, url, { payload, token } = {}) => {
  const headers = token ? { authorization: `Bearer ${token}` } : {}
  const response = await app.inject({ method, url, payload, headers })
  return { status: response.statusCode, body: response.body ? response.json() : null }
}

const register = (overrides = {}) =>
  call('POST', '/auth/register', {
    payload: { name: 'Ana Silva', email: 'Ana@Exemplo.com', password: 'senhaforte1', ...overrides },
  })

test('cadastro cria a conta, já entra e nunca devolve a senha', async () => {
  const { status, body } = await register()

  assert.equal(status, 201)
  assert.equal(body.customer.email, 'ana@exemplo.com')
  assert.ok(body.token.length >= 40)
  assert.equal(body.customer.passwordHash, undefined)
  assert.notEqual(customers[0].passwordHash, 'senhaforte1')
  assert.match(customers[0].passwordHash, /^scrypt\$/)

  const me = await call('GET', '/me', { token: body.token })
  assert.equal(me.status, 200)
  assert.equal(me.body.name, 'Ana Silva')
})

test('cadastro recusa e-mail repetido (sem diferenciar maiúsculas) e dados inválidos', async () => {
  await register()
  const repeated = await register({ email: 'ANA@exemplo.com' })
  assert.equal(repeated.status, 409)
  assert.equal(repeated.body.error, 'email_taken')

  const invalid = await register({ name: 'Ana', email: 'ana@', password: 'curta' })
  assert.equal(invalid.status, 422)
  assert.deepEqual(Object.keys(invalid.body.fields).sort(), ['email', 'name', 'password'])
})

test('login com senha errada ou e-mail inexistente dá a mesma resposta', async () => {
  await register()
  const wrongPassword = await call('POST', '/auth/login', { payload: { email: 'ana@exemplo.com', password: 'outrasenha1' } })
  const unknownEmail = await call('POST', '/auth/login', { payload: { email: 'bia@exemplo.com', password: 'senhaforte1' } })

  assert.equal(wrongPassword.status, 401)
  assert.deepEqual(wrongPassword.body, unknownEmail.body)
})

test('login certo abre sessão; sair invalida o token', async () => {
  await register()
  const login = await call('POST', '/auth/login', { payload: { email: ' ANA@exemplo.com ', password: 'senhaforte1' } })
  assert.equal(login.status, 200)

  const { token } = login.body
  assert.equal((await call('GET', '/me', { token })).status, 200)
  assert.equal((await call('POST', '/auth/logout', { token })).status, 204)
  assert.equal((await call('GET', '/me', { token })).status, 401)
})

test('rotas da conta exigem login', async () => {
  assert.equal((await call('GET', '/me')).status, 401)
  assert.equal((await call('GET', '/me/orders')).status, 401)
  assert.equal((await call('GET', '/me', { token: 'token-inventado' })).status, 401)
})

test('PATCH /me atualiza nome e celular e recusa celular inválido', async () => {
  const { token } = (await register()).body

  const updated = await call('PATCH', '/me', { token, payload: { name: 'Ana  Souza', phone: '(11) 90000-0000' } })
  assert.equal(updated.status, 200)
  assert.equal(updated.body.name, 'Ana Souza')
  assert.equal(updated.body.phone, '11900000000')

  const invalid = await call('PATCH', '/me', { token, payload: { name: 'Ana Souza', phone: '123' } })
  assert.equal(invalid.status, 422)
  assert.ok(invalid.body.fields.phone)
})

test('pedido feito logado fica ligado à conta; sem login, não', async () => {
  const { token, customer } = (await register()).body
  const order = {
    items: [{ productId: 'x', quantity: 1 }],
    customer: { name: 'Ana Silva', email: 'ana@exemplo.com', phone: '11900000000' },
    address: { cep: '01310100', street: 'Av. Paulista', number: '1000', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP' },
    payment: { method: 'pix' },
    expectedTotal: 1,
  }

  await call('POST', '/orders', { token, payload: order })
  assert.equal(placedWith, customer.id)

  await call('POST', '/orders', { payload: order })
  assert.equal(placedWith, null)
})

test('GET /me/orders traz só os pedidos da própria conta', async () => {
  const { token, customer } = (await register()).body
  orders = [
    { id: 'o1', number: 1, customerId: customer.id },
    { id: 'o2', number: 2, customerId: 'outra-conta' },
  ]

  const { status, body } = await call('GET', '/me/orders', { token })
  assert.equal(status, 200)
  assert.deepEqual(body.map((item) => item.number), [1])
})

test('a senha protegida confere só com a senha certa', async () => {
  const stored = await passwordHasher.hash('senhaforte1')
  assert.equal(await passwordHasher.verify('senhaforte1', stored), true)
  assert.equal(await passwordHasher.verify('senhaforte2', stored), false)
  assert.notEqual(stored, await passwordHasher.hash('senhaforte1'), 'cada hash usa um sal diferente')
})
