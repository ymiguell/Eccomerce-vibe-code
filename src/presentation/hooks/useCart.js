import { useEffect, useState } from 'react'
import { addItem, calculateTotals, changeQuantity, countItems, removeItem } from '../../domain/entities/Cart.js'

/** Estado do carrinho na tela. As regras (limites, totais, frete) vêm do domínio. */
export function useCart(getCart, applyCoupon) {
  const [items, setItems] = useState([])
  const [coupon, setCoupon] = useState(null)

  useEffect(() => {
    let active = true

    getCart().then((data) => {
      if (active) setItems(data)
    })

    return () => {
      active = false
    }
  }, [getCart])

  const totals = calculateTotals(items, coupon)

  const redeemCoupon = async (code) => {
    const result = await applyCoupon(code, totals.subtotal)
    if (!result.error) setCoupon(result.coupon)
    return result
  }

  return {
    items,
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
  }
}
