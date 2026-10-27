import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import { CloudinaryImageStorage } from '../src/infrastructure/storage/CloudinaryImageStorage.js'

// Conta de mentira: nada sai para a internet (fetch falso)
const CLOUDINARY_URL = 'cloudinary://chave123:segredo456@loja-teste'

test('envia assinado para a pasta da loja e devolve o endereço https', async () => {
  let sent
  const fetch = async (url, { body }) => {
    sent = { url, body }
    return Response.json({ secure_url: 'https://res.cloudinary.com/loja-teste/image/upload/v1/montreal/produtos/abc123.webp' })
  }
  const storage = new CloudinaryImageStorage({ cloudinaryUrl: CLOUDINARY_URL, fetch })

  const url = await storage.save(Buffer.from('RIFF....WEBP'), 'webp')

  assert.equal(url, 'https://res.cloudinary.com/loja-teste/image/upload/v1/montreal/produtos/abc123.webp')
  assert.equal(sent.url, 'https://api.cloudinary.com/v1_1/loja-teste/image/upload')
  assert.equal(sent.body.get('api_key'), 'chave123')
  assert.equal(sent.body.get('folder'), 'montreal/produtos')
  assert.equal(sent.body.get('api_secret'), null, 'o segredo nunca vai no envio')
  const expected = createHash('sha1').update(`folder=montreal/produtos&timestamp=${sent.body.get('timestamp')}segredo456`).digest('hex')
  assert.equal(sent.body.get('signature'), expected)
})

test('erro do Cloudinary vira exceção (a API responde 500 sem gravar o produto)', async () => {
  const fetch = async () => Response.json({ error: { message: 'Invalid Signature' } }, { status: 401 })
  const storage = new CloudinaryImageStorage({ cloudinaryUrl: CLOUDINARY_URL, fetch })
  await assert.rejects(storage.save(Buffer.from('x'), 'jpg'), /Invalid Signature/)
})

test('só aceita fotos da pasta da loja nesta conta', () => {
  const storage = new CloudinaryImageStorage({ cloudinaryUrl: CLOUDINARY_URL })
  assert.equal(storage.isStored('https://res.cloudinary.com/loja-teste/image/upload/v17/montreal/produtos/abc_1.webp'), true)
  assert.equal(storage.isStored('https://res.cloudinary.com/outra-conta/image/upload/v17/montreal/produtos/abc.webp'), false)
  assert.equal(storage.isStored('https://res.cloudinary.com/loja-teste/image/upload/v17/outra-pasta/abc.webp'), false)
  assert.equal(storage.isStored('https://outro-site.com/foto.jpg'), false)
})

test('CLOUDINARY_URL em formato errado para o servidor com mensagem clara', () => {
  assert.throws(() => new CloudinaryImageStorage({ cloudinaryUrl: 'https://loja-teste' }), /cloudinary:\/\//)
})
