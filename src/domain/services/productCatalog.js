import { getDiscountPercent, isInStock } from '../entities/Product.js'

/*
 * Regras de filtragem e ordenação da listagem de produtos.
 * Funções puras: recebem listas e devolvem novas listas, sem alterar as originais.
 */

export const PRICE_RANGES = Object.freeze([
  { id: 'ate-100', label: 'Até R$ 100', min: 0, max: 100 },
  { id: '100-200', label: 'R$ 100 a R$ 200', min: 100, max: 200 },
  { id: '200-300', label: 'R$ 200 a R$ 300', min: 200, max: 300 },
  { id: 'acima-300', label: 'Acima de R$ 300', min: 300, max: Infinity },
])

export const SORT_OPTIONS = Object.freeze([
  { id: 'relevance', label: 'Relevância' },
  { id: 'price_asc', label: 'Menor preço' },
  { id: 'price_desc', label: 'Maior preço' },
  { id: 'discount', label: 'Maior desconto' },
  { id: 'name', label: 'Nome (A–Z)' },
])

export const EMPTY_FILTERS = Object.freeze({
  categories: [],
  sizes: [],
  colors: [],
  fabrics: [],
  priceRanges: [],
  onlyInStock: false,
})

// Lista vazia = filtro desligado; senão o produto precisa ter pelo menos um dos valores marcados
const matchesAny = (selected, values) => selected.length === 0 || values.some((value) => selected.includes(value))

const inPriceRange = (price, rangeId) => {
  const range = PRICE_RANGES.find((item) => item.id === rangeId)
  return range ? price >= range.min && price < range.max : false
}

export function filterProducts(products, filters) {
  return products.filter(
    (product) =>
      matchesAny(filters.categories, [product.category]) &&
      matchesAny(filters.sizes, product.sizes) &&
      matchesAny(filters.colors, product.colors) &&
      matchesAny(filters.fabrics, [product.fabric]) &&
      (filters.priceRanges.length === 0 || filters.priceRanges.some((id) => inPriceRange(product.price, id))) &&
      (!filters.onlyInStock || isInStock(product)),
  )
}

const comparators = {
  relevance: () => 0,
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  discount: (a, b) => getDiscountPercent(b) - getDiscountPercent(a),
  name: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
}

export function sortProducts(products, sortBy) {
  return [...products].sort(comparators[sortBy] ?? comparators.relevance)
}

export function countActiveFilters(filters) {
  const listCount = ['categories', 'sizes', 'colors', 'fabrics', 'priceRanges'].reduce(
    (sum, key) => sum + filters[key].length,
    0,
  )
  return listCount + (filters.onlyInStock ? 1 : 0)
}

// Tamanhos de roupa em ordem lógica (P antes de G), depois numerações (36, 38...), depois o resto
const LETTER_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG']

function compareSizes(a, b) {
  const rank = (size) => {
    const letter = LETTER_SIZES.indexOf(size)
    if (letter !== -1) return [0, letter]
    if (!Number.isNaN(Number(size))) return [1, Number(size)]
    return [2, 0]
  }
  const [groupA, valueA] = rank(a)
  const [groupB, valueB] = rank(b)
  return groupA - groupB || valueA - valueB || a.localeCompare(b, 'pt-BR')
}

/** Conta quantos produtos têm cada valor, para montar as opções dos filtros. */
function countValues(products, getValues, compare = (a, b) => a.localeCompare(b, 'pt-BR')) {
  const counts = new Map()
  for (const product of products) {
    for (const value of getValues(product)) {
      if (value) counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }
  return [...counts.entries()].sort(([a], [b]) => compare(a, b)).map(([value, count]) => ({ value, count }))
}

/**
 * Produtos parecidos para "Você também pode gostar":
 * primeiro os da mesma categoria, depois os do mesmo nicho; os com estoque antes dos esgotados.
 */
export function getRelatedProducts(product, products, limit = 4) {
  const score = (other) =>
    (other.category === product.category ? 2 : 0) + (other.niche === product.niche ? 1 : 0) + (isInStock(other) ? 0.5 : 0)

  return products
    .filter((other) => other.id !== product.id && other.niche === product.niche)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit)
}

/** Opções disponíveis em cada filtro, geradas a partir dos próprios produtos. */
export function getFilterOptions(products) {
  return {
    categories: countValues(products, (product) => [product.category]),
    sizes: countValues(products, (product) => product.sizes, compareSizes),
    colors: countValues(products, (product) => product.colors),
    fabrics: countValues(products, (product) => [product.fabric]),
    priceRanges: PRICE_RANGES.map((range) => ({
      value: range.id,
      label: range.label,
      count: products.filter((product) => inPriceRange(product.price, range.id)).length,
    })).filter((option) => option.count > 0),
    inStockCount: products.filter(isInStock).length,
  }
}
