import { createContext, useContext } from 'react'

/**
 * Conta do cliente para qualquer componente (NavBar, checkout, "Minha conta").
 * O valor é o objeto retornado por useAuth, ou null quando o site roda sem a API (contas desligadas).
 */
export const AuthContext = createContext(null)

export function useAuthContext() {
  return useContext(AuthContext)
}
