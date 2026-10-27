import { normalizeEmail } from '../../../domain/valueObjects/Email.js'

/**
 * Caso de uso (painel): tirar um e-mail da newsletter, quando o cliente pede (direito garantido pela LGPD).
 * Retorna { removed: true } ou { error: 'subscriber_not_found' }.
 */
export function makeRemoveSubscriber(newsletterRepository) {
  return async function removeSubscriber(email) {
    const removed = await newsletterRepository.remove(normalizeEmail(email))
    return removed ? { removed } : { error: 'subscriber_not_found' }
  }
}
