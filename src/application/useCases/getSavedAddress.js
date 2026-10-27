/** Caso de uso: endereço da compra mais recente da conta logada (para já vir preenchido no checkout), ou null. */
export function makeGetSavedAddress(accountRepository) {
  return async function getSavedAddress() {
    const [latest] = await accountRepository.listOrders()
    return latest?.address ?? null
  }
}
