import assert from 'node:assert/strict'
import { test } from 'node:test'
import { makeCheckHealth } from '../src/application/useCases/checkHealth.js'
import { buildApp } from '../src/http/app.js'

// Banco falso: os testes não precisam do PostgreSQL rodando
const databaseUp = { ping: async () => {} }
const databaseDown = {
  ping: async () => {
    throw new Error('connection refused')
  },
}
const fixedNow = () => new Date('2026-10-26T12:00:00Z')

async function appWith(databaseStatus) {
  const checkHealth = makeCheckHealth(databaseStatus, { now: fixedNow })
  return buildApp({ corsOrigins: ['http://localhost:5173'], useCases: { checkHealth }, logger: false })
}

test('GET /health responde 200 quando o banco está no ar', async () => {
  const app = await appWith(databaseUp)
  const response = await app.inject({ method: 'GET', url: '/health' })

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), { status: 'ok', database: 'up', time: '2026-10-26T12:00:00.000Z' })
})

test('GET /health responde 503 quando o banco não responde', async () => {
  const app = await appWith(databaseDown)
  const response = await app.inject({ method: 'GET', url: '/health' })

  assert.equal(response.statusCode, 503)
  assert.equal(response.json().database, 'down')
})

test('rota inexistente responde 404 no formato padrão', async () => {
  const app = await appWith(databaseUp)
  const response = await app.inject({ method: 'GET', url: '/nao-existe' })

  assert.equal(response.statusCode, 404)
  assert.deepEqual(response.json(), { error: 'not_found', message: 'Rota não encontrada.' })
})

test('CORS libera só o site configurado', async () => {
  const app = await appWith(databaseUp)
  const allowed = await app.inject({ method: 'GET', url: '/health', headers: { origin: 'http://localhost:5173' } })
  const blocked = await app.inject({ method: 'GET', url: '/health', headers: { origin: 'https://outro-site.com' } })

  assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173')
  assert.equal(blocked.headers['access-control-allow-origin'], undefined)
})
