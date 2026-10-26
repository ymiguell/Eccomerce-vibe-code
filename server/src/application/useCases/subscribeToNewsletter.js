import { isValidEmail, normalizeEmail } from '../../domain/valueObjects/Email.js'

/**
 * Caso de uso: inscrever um e-mail na newsletter.
 * Retorna { ok: true } ou { error: 'invalid_email' | 'already_subscribed' }.
 */
export function makeSubscribeToNewsletter(newsletterRepository) {
  return async function subscribeToNewsletter(email) {
    if (!isValidEmail(email)) return { error: 'invalid_email' }

    const added = await newsletterRepository.add(normalizeEmail(email))
    return added ? { ok: true } : { error: 'already_subscribed' }
  }
}
