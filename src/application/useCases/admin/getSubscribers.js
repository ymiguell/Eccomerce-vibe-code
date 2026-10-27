/** Caso de uso (painel): inscritos na newsletter, dos mais recentes para os mais antigos. */
export function makeGetSubscribers(adminRepository) {
  return function getSubscribers() {
    return adminRepository.listSubscribers()
  }
}
