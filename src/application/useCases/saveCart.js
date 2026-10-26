import { toCartEntry } from '../../domain/entities/Cart.js'

/** Caso de uso: guardar a sacola atual para ela continuar lá depois (ao atualizar a página, por exemplo). */
export function makeSaveCart(cartRepository) {
  return async function saveCart(items) {
    await cartRepository.saveItems(items.map(toCartEntry))
  }
}
