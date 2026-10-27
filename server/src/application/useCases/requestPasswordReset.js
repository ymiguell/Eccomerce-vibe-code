import { isValidEmail, normalizeEmail } from '../../domain/valueObjects/Email.js'

function passwordResetEmail({ customer, link }) {
  const firstName = customer.name.split(' ')[0]
  return {
    to: customer.email,
    subject: 'Redefina sua senha — Montreal Moda e Casa',
    text: [
      `Olá, ${firstName}!`,
      '',
      'Recebemos um pedido para trocar a senha da sua conta. Para criar uma senha nova, abra o link abaixo:',
      '',
      link,
      '',
      'O link vale por 1 hora e só pode ser usado uma vez.',
      'Se não foi você, ignore este e-mail: sua senha continua a mesma.',
    ].join('\n'),
  }
}

/**
 * Caso de uso: "esqueci minha senha". Se o e-mail tem conta, manda um link para criar uma senha nova.
 * Retorna {} sempre que o e-mail é válido — com ou sem conta — para não revelar quem é cliente;
 * { error: 'invalid_data', fields } se o e-mail é inválido.
 * `siteUrl`: endereço do site, onde fica a página /redefinir-senha.
 */
export function makeRequestPasswordReset({ customerRepository, passwordResetRepository, emailSender, siteUrl }) {
  return async function requestPasswordReset({ email }) {
    if (!isValidEmail(email)) {
      return { error: 'invalid_data', fields: { email: 'Informe um e-mail válido, ex.: nome@email.com.' } }
    }

    const customer = await customerRepository.findByEmail(normalizeEmail(email))
    if (!customer) return {}

    const token = await passwordResetRepository.create(customer.id)
    const link = `${siteUrl}/redefinir-senha?token=${encodeURIComponent(token)}`
    // Sem esperar o envio: a resposta sai no mesmo tempo com ou sem conta (o tempo também não revela nada)
    emailSender.send(passwordResetEmail({ customer, link })).catch((error) => {
      console.error('Falha ao enviar o e-mail de redefinição de senha:', error)
    })
    return {}
  }
}
