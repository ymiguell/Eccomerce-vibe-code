import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BrevoEmailSender } from '../src/infrastructure/email/BrevoEmailSender.js'

// Conta de mentira: nada sai para a internet (fetch falso)
const sender = { email: 'loja@exemplo.com', name: 'Loja Teste' }

test('envia o e-mail em texto pela API do Brevo, com a chave no cabeçalho', async () => {
  let sent
  const fetch = async (url, options) => {
    sent = { url, options }
    return Response.json({ messageId: '<abc@brevo>' }, { status: 201 })
  }
  const emailSender = new BrevoEmailSender({ apiKey: 'chave123', sender, fetch })

  await emailSender.send({ to: 'cliente@exemplo.com', subject: 'Redefinir senha', text: 'Seu link: https://loja/x' })

  assert.equal(sent.url, 'https://api.brevo.com/v3/smtp/email')
  assert.equal(sent.options.headers['api-key'], 'chave123')
  assert.deepEqual(JSON.parse(sent.options.body), {
    sender,
    to: [{ email: 'cliente@exemplo.com' }],
    subject: 'Redefinir senha',
    textContent: 'Seu link: https://loja/x',
  })
})

test('erro do Brevo vira exceção', async () => {
  const fetch = async () => Response.json({ code: 'unauthorized', message: 'Key not found' }, { status: 401 })
  const emailSender = new BrevoEmailSender({ apiKey: 'errada', sender, fetch })
  await assert.rejects(emailSender.send({ to: 'a@b.com', subject: 's', text: 't' }), /Key not found/)
})

test('sem chave ou sem remetente não sobe', () => {
  assert.throws(() => new BrevoEmailSender({ apiKey: '', sender }), /BREVO_API_KEY/)
  assert.throws(() => new BrevoEmailSender({ apiKey: 'x', sender: {} }), /EMAIL_FROM/)
})
