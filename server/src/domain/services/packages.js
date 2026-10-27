/*
 * Caixa e peso típicos de cada categoria, usados para cotar o frete com as transportadoras.
 * Medidas em centímetros e peso em quilos, já com a embalagem. Valores aproximados: ajuste se a loja embalar diferente.
 */

const DEFAULT_PACKAGE = Object.freeze({ weight: 0.5, height: 10, width: 20, length: 25 })

const pkg = (weight, height, width, length) => Object.freeze({ weight, height, width, length })

const PACKAGES_BY_CATEGORY = Object.freeze({
  // Moda
  Camisetas: pkg(0.25, 4, 20, 28),
  Calças: pkg(0.6, 6, 25, 32),
  Calçados: pkg(1, 12, 20, 32),
  Conjuntos: pkg(0.4, 5, 22, 30),
  Cuecas: pkg(0.2, 4, 15, 20),
  Jaquetas: pkg(0.9, 8, 30, 35),
  Lingerie: pkg(0.15, 4, 15, 20),
  Meias: pkg(0.1, 3, 12, 18),
  Pijamas: pkg(0.35, 5, 22, 28),
  Vestidos: pkg(0.4, 5, 25, 32),
  // Casa
  Banho: pkg(0.8, 10, 25, 35),
  Cama: pkg(2, 15, 35, 45),
  Cozinha: pkg(1.5, 15, 25, 30),
  Decoração: pkg(1, 15, 20, 25),
  Eletroportáteis: pkg(5, 35, 35, 40),
  'Mesa posta': pkg(1.5, 15, 25, 30),
  // Saúde
  Beleza: pkg(0.3, 8, 10, 15),
  'Bem-estar': pkg(0.5, 10, 15, 20),
  Cuidados: pkg(0.3, 8, 10, 15),
  Dermocosméticos: pkg(0.25, 8, 10, 15),
  Fitness: pkg(1, 10, 25, 30),
  Higiene: pkg(0.4, 10, 12, 18),
  // Tecnologia
  Acessórios: pkg(0.2, 5, 12, 18),
  'Caixas de som': pkg(0.8, 15, 15, 20),
  'Fones de ouvido': pkg(0.3, 8, 15, 18),
  Periféricos: pkg(0.5, 8, 20, 25),
  Smartphones: pkg(0.5, 8, 12, 20),
  Smartwatches: pkg(0.3, 8, 10, 15),
  Tablets: pkg(0.8, 8, 20, 28),
})

/** Caixa de um produto: a da categoria dele ou, para categorias novas, uma caixa média. */
export function packageFor(product) {
  return PACKAGES_BY_CATEGORY[product.category] ?? DEFAULT_PACKAGE
}
