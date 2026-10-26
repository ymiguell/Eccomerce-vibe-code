import { useEffect, useState } from 'react'

// Falha inesperada (ex.: servidor fora do ar no meio do envio) vira um erro que a tela sabe mostrar
async function safely(run) {
  try {
    return await run()
  } catch (error) {
    console.error('Falha na conta:', error)
    return { error: 'unknown' }
  }
}

/**
 * Estado de login. `account` são os casos de uso de conta (definidos fora do componente, para serem estáveis)
 * ou null quando as contas estão desligadas — aí o hook também retorna null.
 * status: 'loading' enquanto confere se há sessão guardada; depois 'ready'.
 */
export function useAuth(account) {
  const [state, setState] = useState({ status: 'loading', customer: null })

  useEffect(() => {
    if (!account) return
    let active = true

    account
      .getCurrentCustomer()
      .catch((error) => {
        console.error('Falha ao conferir a sessão:', error)
        return null
      })
      .then((customer) => {
        if (active) setState({ status: 'ready', customer })
      })

    return () => {
      active = false
    }
  }, [account])

  if (!account) return null

  // Login, cadastro e perfil: quando dá certo, a conta na tela é atualizada
  const run = async (action, input) => {
    const result = await safely(() => action(input))
    if (result.customer) setState({ status: 'ready', customer: result.customer })
    return result
  }

  return {
    status: state.status,
    customer: state.customer,
    login: (input) => run(account.loginCustomer, input),
    register: (input) => run(account.registerCustomer, input),
    updateProfile: (input) => run(account.updateProfile, input),
    logout: async () => {
      await safely(account.logoutCustomer)
      setState({ status: 'ready', customer: null })
    },
    getMyOrders: account.getMyOrders,
  }
}
