import { Navigate, useNavigate } from 'react-router'
import OrderHistory from '../components/account/OrderHistory.jsx'
import ProfileForm from '../components/account/ProfileForm.jsx'
import { useAuthContext } from '../context/authContext.js'
import { useMyOrders } from '../hooks/useMyOrders.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

function AccountSkeleton() {
  return <main className="min-h-[60vh]" aria-busy="true" />
}

/** Conteúdo de "Minha conta" (só monta com alguém logado, para os pedidos carregarem de quem está logado). */
function AccountContent({ auth }) {
  const orders = useMyOrders(auth.getMyOrders)
  const navigate = useNavigate()
  const firstName = auth.customer.name.split(' ')[0]

  // Vai para a loja antes de sair: senão esta página veria "ninguém logado" e mandaria para /entrar
  const handleLogout = () => {
    navigate('/', { replace: true })
    auth.logout()
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Olá, {firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{auth.customer.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-11 rounded-sm border border-border px-5 text-sm font-semibold tracking-wide uppercase transition-colors duration-200 hover:border-foreground"
        >
          Sair
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <section aria-labelledby="my-orders-title">
          <h2 id="my-orders-title" className="text-2xl font-semibold">
            Meus pedidos
          </h2>
          <div className="mt-4">
            <OrderHistory status={orders.status} orders={orders.orders} />
          </div>
        </section>

        <section aria-labelledby="my-data-title" className="h-fit rounded-sm border border-border p-5 sm:p-6">
          <h2 id="my-data-title" className="text-2xl font-semibold">
            Meus dados
          </h2>
          <div className="mt-4">
            <ProfileForm customer={auth.customer} onSave={auth.updateProfile} />
          </div>
        </section>
      </div>
    </main>
  )
}

/** "Minha conta" (/minha-conta): pedidos e dados do cliente. Sem login, manda para /entrar e volta depois. */
function AccountPage() {
  usePageTitle('Minha conta')
  const auth = useAuthContext()

  if (auth.status === 'loading') return <AccountSkeleton />
  if (!auth.customer) return <Navigate to="/entrar?voltar=/minha-conta" replace />
  return <AccountContent auth={auth} />
}

export default AccountPage
