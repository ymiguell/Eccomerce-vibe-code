import { useState } from 'react'
import { isInStock, isLowStock, isOnSale } from '../../../domain/entities/Product.js'
import AdminLoadError from '../../components/admin/AdminLoadError.jsx'
import AdminProductCard from '../../components/admin/AdminProductCard.jsx'
import FilterChips from '../../components/admin/FilterChips.jsx'
import ListSkeleton from '../../components/admin/ListSkeleton.jsx'
import { fieldClass } from '../../components/form/formStyles.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useRemoteData } from '../../hooks/useRemoteData.js'

const FILTERS = [
  { value: 'all', label: 'Todos', matches: () => true },
  { value: 'low', label: 'Estoque baixo', matches: isLowStock },
  { value: 'out', label: 'Esgotados', matches: (product) => !isInStock(product) },
  { value: 'sale', label: 'Em promoção', matches: isOnSale },
  { value: 'featured', label: 'Destaques', matches: (product) => product.isFeatured },
]

// Busca sem diferenciar maiúsculas nem acentos ("calca" encontra "Calça")
const normalize = (text) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Painel → Produtos (/admin/produtos): busca, filtros de estoque e promoção, e edição de cada produto. */
function AdminProductsPage({ getInventory, updateProduct }) {
  usePageTitle('Painel: produtos')
  const products = useRemoteData(getInventory)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const handleSave = async (productId, changes) => {
    const result = await updateProduct(productId, changes)
    if (result.product) {
      products.update((list) => list.map((product) => (product.id === productId ? result.product : product)))
    }
    return result
  }

  const list = products.data ?? []
  const options = FILTERS.map((item) => ({ ...item, count: products.data ? list.filter(item.matches).length : undefined }))
  const term = normalize(search.trim())
  const visible = list
    .filter(FILTERS.find((item) => item.value === filter).matches)
    .filter((product) => !term || normalize(product.name).includes(term))

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="admin-product-search" className="text-sm font-medium">
          Buscar produto
        </label>
        <input
          id="admin-product-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nome do produto"
          autoComplete="off"
          className={`${fieldClass} block sm:max-w-sm`}
        />
      </div>

      <FilterChips label="Filtrar produtos" options={options} value={filter} onChange={setFilter} />

      {products.status === 'failed' ? (
        <AdminLoadError error={products.error} onRetry={products.reload} />
      ) : !products.data ? (
        <ListSkeleton />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {visible.length} {visible.length === 1 ? 'produto' : 'produtos'}
          </p>
          {visible.length > 0 && (
            <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {visible.map((product) => (
                <AdminProductCard key={product.id} product={product} onSave={handleSave} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

export default AdminProductsPage
