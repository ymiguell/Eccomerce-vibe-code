import { useState } from 'react'
import { Link } from 'react-router'
import NewProductForm from '../../components/admin/NewProductForm.jsx'
import { primaryButtonClass } from '../../components/form/formStyles.js'
import { formatPrice } from '../../formatters/currency.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useRemoteData } from '../../hooks/useRemoteData.js'

// Categorias que já existem em cada área: { moda: ['Calças', 'Camisetas'...], casa: [...] }
function groupCategories(products = []) {
  const groups = {}
  for (const product of products) (groups[product.niche] ??= new Set()).add(product.category)
  return Object.fromEntries(Object.entries(groups).map(([niche, set]) => [niche, [...set].sort((a, b) => a.localeCompare(b))]))
}

const linkClass = 'font-semibold text-primary underline underline-offset-4 hover:text-primary-hover'

/** Painel → Produtos → Novo produto (/admin/produtos/novo). */
function AdminNewProductPage({ getInventory, createProduct }) {
  usePageTitle('Painel: novo produto')
  // Só para sugerir categorias: se a lista não carregar, o formulário funciona sem sugestões
  const inventory = useRemoteData(getInventory)
  const [created, setCreated] = useState(null)
  // Trocar a chave recria o formulário vazio para cadastrar outro
  const [formKey, setFormKey] = useState(0)

  if (created) {
    return (
      <div role="status" className="max-w-xl rounded-sm border border-border p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Produto cadastrado</h2>
        <div className="mt-4 flex gap-4">
          {created.imageUrl && (
            <img src={created.imageUrl} alt="" width="80" height="80" className="size-20 shrink-0 rounded-sm bg-white object-cover" />
          )}
          <div className="min-w-0">
            <p className="font-semibold">{created.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{created.category}</p>
            <p className="mt-1 text-sm font-semibold">{formatPrice(created.price)}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Ele já aparece na loja, na página da área escolhida.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <button
            type="button"
            onClick={() => {
              setCreated(null)
              setFormKey((key) => key + 1)
            }}
            className={primaryButtonClass}
          >
            Cadastrar outro
          </button>
          <Link to={`/produto/${created.id}`} className={`${linkClass} inline-flex min-h-11 items-center`}>
            Ver na loja
          </Link>
          <Link to="/admin/produtos" className={`${linkClass} inline-flex min-h-11 items-center`}>
            Voltar para produtos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <Link to="/admin/produtos" className={`${linkClass} inline-flex min-h-11 items-center text-sm`}>
        ← Produtos
      </Link>
      <h2 className="mt-2 text-xl font-semibold">Novo produto</h2>
      <div className="mt-5">
        <NewProductForm
          key={formKey}
          categoriesByNiche={groupCategories(inventory.data ?? [])}
          onCreate={createProduct}
          onCreated={(product) => {
            setCreated(product)
            window.scrollTo({ top: 0, behavior: 'instant' })
          }}
        />
      </div>
    </div>
  )
}

export default AdminNewProductPage
