/*
 * Páginas de nicho da loja. Cada item vira uma rota (/moda, /casa...) com
 * banner, barra de filtros e carrossel de produtos daquele nicho.
 *
 * - `slug`: endereço da página e também o valor de `niche` dos produtos e `placement` dos banners.
 * - `filterLabels`: nomes dos filtros que mudam conforme o nicho.
 * Para criar uma página nova: adicione um item aqui, o link na NavBar e os produtos/banners nos repositórios.
 */
export const NICHE_PAGES = [
  {
    slug: 'moda',
    title: 'Moda',
    productsTitle: 'Produtos de moda',
    filterLabels: { category: 'Tipo de peça', size: 'Tamanho', fabric: 'Tecido' },
  },
  {
    slug: 'casa',
    title: 'Casa',
    productsTitle: 'Produtos para casa',
    filterLabels: { category: 'Tipo de produto', size: 'Tamanho', fabric: 'Material' },
  },
  {
    slug: 'tecnologia',
    title: 'Tecnologia',
    productsTitle: 'Produtos de tecnologia',
    filterLabels: { category: 'Tipo de produto', size: 'Tamanho', fabric: 'Material' },
  },
  {
    slug: 'saude',
    title: 'Saúde',
    productsTitle: 'Saúde e bem-estar',
    filterLabels: { category: 'Tipo de produto', size: 'Tamanho', fabric: 'Material' },
  },
]
