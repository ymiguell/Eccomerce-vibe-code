import { createContext, useContext } from 'react'

/**
 * Deixa a sacola disponível para qualquer componente (ex.: o botão do ProductCard),
 * sem precisar passar props por Página → Carrossel/Grade → Card.
 * O valor é o objeto retornado por useCart + `openCart()` (abre a gaveta da sacola), fornecido no App.jsx.
 */
export const CartContext = createContext(null)

export function useCartContext() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('useCartContext precisa estar dentro de <CartContext value={cart}>')
  return cart
}
