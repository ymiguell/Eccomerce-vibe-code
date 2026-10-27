/** Caso de uso (painel): todos os inscritos na newsletter, dos mais recentes para os mais antigos. */
export function makeListSubscribers(newsletterRepository) {
  return function listSubscribers() {
    return newsletterRepository.findAll()
  }
}
