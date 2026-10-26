import { useEffect, useState } from 'react'
import { addItem, calculateTotals, changeQuantity, countItems, removeItem } from '../../domain/entities/Cart.js'

/**
 * Estado do carrinho na tela. As regras (limites, totais, frete) vêm do domínio.
 * Começa com o que estava guardado e salva de novo a cada mudança.
 */
export function useCart(getCart, saveCart, applyCoupon) {
  const [items, setItems] = useState([])
  const [isLoaded, setLoaded] = useState(false)
  const [coupon, setCoupon] = useState(null)

  useEffect(() => {
    let active = true

    getCart().then((saved) => {
      if (!active) return
      setItems(saved)
      setLoaded(true)
    })

    return () => {
      active = false
    }
  }, [getCart])

  // Só salva depois de carregar: a lista vazia inicial não pode apagar a sacola guardada
  useEffect(() => {
    if (isLoaded) saveCart(items)
  }, [items, isLoaded, saveCart])

  const totals = calculateTotals(items, coupon)

  const redeemCoupon = async (code) => {
    const result = await applyCoupon(code, totals.subtotal)
    if (!result.error) setCoupon(result.coupon)
    return result
  }

  return {
    items,
    isLoaded,
    coupon,
    totals,
    count: countItems(items),
    // options: { size, color } escolhidos pelo cliente (ver getRequiredOptions no domínio)
    add: (product, options) => setItems((current) => addItem(current, product, options)),
    // itemKey identifica a linha (produto + tamanho + cor), ver getItemKey no domínio
    increment: (itemKey) => setItems((current) => changeQuantity(current, itemKey, 1)),
    decrement: (itemKey) => setItems((current) => changeQuantity(current, itemKey, -1)),
    remove: (itemKey) => setItems((current) => removeItem(current, itemKey)),
    redeemCoupon,
    removeCoupon: () => setCoupon(null),
    // Depois de finalizar o pedido
    clear: () => {
      setItems([])
      setCoupon(null)
    },
  }
}
