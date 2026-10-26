import { isValidEmail, normalizeEmail } from '../../domain/valueObjects/Email.js'

/**
 * Caso de uso: inscrever um e-mail na newsletter.
 * Confere o formato antes de enviar; se já está inscrito, quem responde é o repositório (API ou mock).
 * Retorna { ok: true } ou { error: 'invalid_email' | 'already_subscribed' | outro código (ex.: sem conexão) }.
 */
export function makeSubscribeToNewsletter(newsletterRepository) {
  return async function subscribeToNewsletter(email) {
    if (!isValidEmail(email)) return { error: 'invalid_email' }
    return newsletterRepository.subscribe(normalizeEmail(email))
  }
}
