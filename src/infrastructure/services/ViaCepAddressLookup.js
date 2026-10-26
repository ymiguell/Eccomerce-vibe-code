/*
 * Busca o endereço pelo CEP no ViaCEP (serviço público e gratuito: https://viacep.com.br).
 * Só o CEP é enviado. Se o serviço demorar ou cair, o caso de uso devolve 'unavailable' e o cliente preenche à mão.
 */
const TIMEOUT_MS = 5000

export class ViaCepAddressLookup {
  async findByCep(cep) {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!response.ok) throw new Error(`ViaCEP respondeu ${response.status}`)

    const data = await response.json()
    // CEP com formato certo mas inexistente: o ViaCEP responde { erro: true }
    if (data.erro) return null

    return {
      street: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    }
  }
}
