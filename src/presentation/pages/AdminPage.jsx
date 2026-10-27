import { Link, Navigate, Route, Routes, useLocation } from 'react-router'
import AdminTabs from '../components/admin/AdminTabs.jsx'
import { useAuthContext } from '../context/authContext.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import AdminCouponsPage from './admin/AdminCouponsPage.jsx'
import AdminNewsletterPage from './admin/AdminNewsletterPage.jsx'
import AdminOrdersPage from './admin/AdminOrdersPage.jsx'
import AdminProductsPage from './admin/AdminProductsPage.jsx'
import AdminReviewsPage from './admin/AdminReviewsPage.jsx'

function NotAllowed() {
  usePageTitle('Painel da loja')
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Área da equipe</h1>
      <p className="mt-2 text-sm text-muted-foreground">Esta página é só para a equipe da loja.</p>
      <Link to="/" className="mt-6 inline-block text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-hover">
        Voltar para a loja
      </Link>
    </main>
  )
}

/**
 * Painel da loja (/admin, /admin/produtos, /admin/cupons, /admin/avaliacoes, /admin/newsletter). Só para contas da equipe (isAdmin).
 * Esconder a página é só conforto: quem protege de verdade é a API, que confere a conta em cada chamada.
 * `admin`: os casos de uso do painel (App.jsx).
 */
function AdminPage({ admin }) {
  const auth = useAuthContext()
  const location = useLocation()

  if (auth.status === 'loading') return <main className="min-h-[60vh]" aria-busy="true" />
  if (!auth.customer) return <Navigate to={`/entrar?voltar=${encodeURIComponent(location.pathname)}`} replace />
  if (!auth.customer.isAdmin) return <NotAllowed />

  return (
    <main className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Painel da loja</h1>
      <p className="mt-1 text-sm text-muted-foreground">Pedidos, estoque, preços, cupons, avaliações e newsletter.</p>

      <div className="mt-6">
        <AdminTabs />
      </div>

      <div className="mt-6">
        <Routes>
          <Route
            index
            element={
              <AdminOrdersPage
                getAdminOrders={admin.getAdminOrders}
                changeOrderStatus={admin.changeOrderStatus}
                setTrackingCode={admin.setTrackingCode}
              />
            }
          />
          <Route path="produtos" element={<AdminProductsPage getInventory={admin.getInventory} updateProduct={admin.updateProduct} />} />
          <Route
            path="cupons"
            element={
              <AdminCouponsPage getCoupons={admin.getCoupons} createCoupon={admin.createCoupon} setCouponActive={admin.setCouponActive} />
            }
          />
          <Route
            path="avaliacoes"
            element={<AdminReviewsPage getAdminReviews={admin.getAdminReviews} setReviewHidden={admin.setReviewHidden} />}
          />
          <Route
            path="newsletter"
            element={<AdminNewsletterPage getSubscribers={admin.getSubscribers} removeSubscriber={admin.removeSubscriber} />}
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </main>
  )
}

export default AdminPage
