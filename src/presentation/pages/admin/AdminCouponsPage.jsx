import { useState } from 'react'
import AdminCouponCard from '../../components/admin/AdminCouponCard.jsx'
import AdminLoadError from '../../components/admin/AdminLoadError.jsx'
import ListSkeleton from '../../components/admin/ListSkeleton.jsx'
import NewCouponForm from '../../components/admin/NewCouponForm.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useRemoteData } from '../../hooks/useRemoteData.js'

/** Painel → Cupons (/admin/cupons): criar cupom e ligar/desligar os existentes. */
function AdminCouponsPage({ getCoupons, createCoupon, setCouponActive }) {
  usePageTitle('Painel: cupons')
  const coupons = useRemoteData(getCoupons)
  // Nova key a cada cupom criado: o formulário volta vazio
  const [formKey, setFormKey] = useState(0)
  const [notice, setNotice] = useState('')

  const handleCreate = async (input) => {
    const result = await createCoupon(input)
    if (result.coupon) {
      coupons.update((list) => [result.coupon, ...list])
      setFormKey((key) => key + 1)
      setNotice(`Cupom ${result.coupon.code} criado. Já vale na loja.`)
    }
    return result
  }

  const handleToggle = async (code, active) => {
    const result = await setCouponActive(code, active)
    if (result.coupon) coupons.update((list) => list.map((coupon) => (coupon.code === code ? result.coupon : coupon)))
    return result
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
      {/* No celular o formulário vem primeiro; no computador fica na coluna da direita */}
      <section aria-labelledby="new-coupon-title" className="h-fit rounded-sm border border-border p-5 sm:p-6 lg:col-start-2 lg:row-start-1">
        <h2 id="new-coupon-title" className="text-xl font-semibold">
          Novo cupom
        </h2>
        <div aria-live="polite">{notice && <p className="mt-3 rounded-sm bg-muted px-4 py-3 text-sm font-medium">{notice}</p>}</div>
        <div className="mt-4">
          <NewCouponForm key={formKey} onCreate={handleCreate} />
        </div>
      </section>

      <section aria-labelledby="coupons-title" className="lg:col-start-1 lg:row-start-1">
        <h2 id="coupons-title" className="text-xl font-semibold">
          Cupons
        </h2>
        <div className="mt-4">
          {coupons.status === 'failed' ? (
            <AdminLoadError error={coupons.error} onRetry={coupons.reload} />
          ) : !coupons.data ? (
            <ListSkeleton rows={2} />
          ) : coupons.data.length === 0 ? (
            <p className="rounded-sm border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhum cupom ainda. Crie o primeiro ao lado.
            </p>
          ) : (
            <ul className="space-y-3">
              {coupons.data.map((coupon) => (
                <AdminCouponCard key={coupon.code} coupon={coupon} onToggle={handleToggle} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

export default AdminCouponsPage
