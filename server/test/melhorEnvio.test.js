import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createProduct } from '../src/domain/entities/Product.js'
import { MelhorEnvioShippingQuoter } from '../src/infrastructure/shipping/MelhorEnvioShippingQuoter.js'

// Conta de mentira: nada sai para a internet (fetch falso)
const camiseta = createProduct({ id: 'camiseta', name: 'Camiseta', niche: 'moda', category: 'Camisetas', price: 59.9 })

test('cota com o token, o CEP da loja e a caixa da categoria; ignora serviços com erro', async () => {
  let sent
  const fetch = async (url, options) => {
    sent = { url, options }
    return Response.json([
      {
        id: 1,
        name: 'PAC',
        price: '21.30',
        custom_price: '22.80',
        delivery_range: { min: 3, max: 6 },
        custom_delivery_range: { min: 4, max: 7 },
        company: { name: 'Correios' },
      },
      { id: 3, name: '.Package', error: 'Transportadora não atende este trecho.', company: { name: 'Jadlog' } },
    ])
  }
  const quoter = new MelhorEnvioShippingQuoter({ token: 'tok', fromCep: '13844110', contactEmail: 'loja@exemplo.com', fetch })

  const options = await quoter.quote({ cep: '01310100', items: [{ product: camiseta, quantity: 2 }] })

  assert.equal(sent.url, 'https://melhorenvio.com.br/api/v2/me/shipment/calculate')
  assert.equal(sent.options.headers.authorization, 'Bearer tok')
  assert.match(sent.options.headers['user-agent'], /loja@exemplo\.com/)
  const body = JSON.parse(sent.options.body)
  assert.deepEqual(body.from, { postal_code: '13844110' })
  assert.equal(body.services, '1,2,3,4,33', 'só os serviços que a loja posta')
  assert.deepEqual(body.products, [
    { id: 'camiseta', weight: 0.25, height: 4, width: 20, length: 28, insurance_value: 59.9, quantity: 2 },
  ])
  // Preço e prazo da conta (custom_*); o prazo final soma até 2 dias de postagem
  assert.deepEqual(options, [{ id: '1', name: 'PAC', company: 'Correios', price: 22.8, minDays: 4, maxDays: 9 }])
})

test('sandbox usa o endereço de testes do Melhor Envio', async () => {
  let url
  const fetch = async (requestUrl) => {
    url = requestUrl
    return Response.json([])
  }
  const quoter = new MelhorEnvioShippingQuoter({ token: 'tok', fromCep: '13844110', sandbox: true, contactEmail: 'a@b.com', fetch })
  await quoter.quote({ cep: '01310100', items: [{ product: camiseta, quantity: 1 }] })
  assert.equal(url, 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate')
})

test('erro do Melhor Envio vira exceção (a loja responde que o frete está indisponível)', async () => {
  const fetch = async () => Response.json({ message: 'Unauthenticated.' }, { status: 401 })
  const quoter = new MelhorEnvioShippingQuoter({ token: 'errado', fromCep: '13844110', contactEmail: 'a@b.com', fetch })
  await assert.rejects(quoter.quote({ cep: '01310100', items: [{ product: camiseta, quantity: 1 }] }), /Unauthenticated/)
})

test('sem token ou com CEP de postagem inválido não sobe', () => {
  assert.throws(() => new MelhorEnvioShippingQuoter({ token: '', fromCep: '13844110' }), /MELHOR_ENVIO_TOKEN/)
  assert.throws(() => new MelhorEnvioShippingQuoter({ token: 'x', fromCep: '1384' }), /STORE_CEP/)
})
