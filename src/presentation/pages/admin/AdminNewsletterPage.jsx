import { useState } from 'react'
import { downloadFile } from '../../browser/downloadFile.js'
import AdminLoadError from '../../components/admin/AdminLoadError.jsx'
import ListSkeleton from '../../components/admin/ListSkeleton.jsx'
import { fieldClass } from '../../components/form/formStyles.js'
import { formatAdminError } from '../../formatters/adminErrors.js'
import { toCsv } from '../../formatters/csv.js'
import { formatOrderDate } from '../../formatters/order.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useRemoteData } from '../../hooks/useRemoteData.js'

const smallButton =
  'min-h-11 shrink-0 rounded-sm border border-border px-4 text-sm font-semibold transition-colors duration-200 hover:border-foreground disabled:opacity-60'

const dateForSheet = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })

/** Um inscrito: e-mail, data e "Remover" (com confirmação, porque o e-mail sai da lista de vez). */
function SubscriberRow({ subscriber, onRemove }) {
  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const remove = async () => {
    setSending(true)
    setError('')
    const result = await onRemove(subscriber.email)
    // Deu certo: a linha sai da lista
    if (!result.removed) {
      setSending(false)
      setError(formatAdminError(result.error))
    }
  }

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-sm font-medium break-all">{subscriber.email}</p>
          <p className="text-xs text-muted-foreground">Inscrito em {formatOrderDate(subscriber.createdAt)}</p>
        </div>
        {confirming ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">Tirar da lista?</span>
            <button type="button" onClick={remove} disabled={sending} className={`${smallButton} border-primary bg-primary text-on-primary hover:bg-primary-hover`}>
              {sending ? 'Removendo…' : 'Sim, remover'}
            </button>
            <button type="button" autoFocus onClick={() => setConfirming(false)} disabled={sending} className={smallButton}>
              Voltar
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className={`${smallButton} text-primary`}>
            Remover
          </button>
        )}
      </div>
      <div aria-live="polite">{error && <p className="mt-1 text-sm font-medium text-primary">{error}</p>}</div>
    </li>
  )
}

/** Painel → Newsletter (/admin/newsletter): inscritos, busca, planilha para o envio de e-mails e remoção a pedido. */
function AdminNewsletterPage({ getSubscribers, removeSubscriber }) {
  usePageTitle('Painel: newsletter')
  const subscribers = useRemoteData(getSubscribers)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')

  const handleRemove = async (email) => {
    const result = await removeSubscriber(email)
    if (result.removed) {
      subscribers.update((list) => list.filter((item) => item.email !== email))
      setNotice(`${email} saiu da lista.`)
    }
    return result
  }

  const exportSheet = () => {
    const csv = toCsv(subscribers.data, [
      { label: 'E-mail', value: (row) => row.email },
      { label: 'Inscrito em', value: (row) => dateForSheet.format(new Date(row.createdAt)) },
    ])
    downloadFile(`newsletter-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8')
  }

  const list = subscribers.data ?? []
  const term = search.trim().toLowerCase()
  const visible = term ? list.filter((item) => item.email.includes(term)) : list

  return (
    <div className="space-y-5">
      {subscribers.status === 'failed' ? (
        <AdminLoadError error={subscribers.error} onRetry={subscribers.reload} />
      ) : !subscribers.data ? (
        <ListSkeleton rows={2} />
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-semibold tabular-nums">{list.length}</p>
              <p className="text-sm text-muted-foreground">{list.length === 1 ? 'pessoa inscrita' : 'pessoas inscritas'}</p>
            </div>
            <button type="button" onClick={exportSheet} disabled={list.length === 0} className={smallButton}>
              Baixar planilha (CSV)
            </button>
          </div>

          <div>
            <label htmlFor="admin-newsletter-search" className="text-sm font-medium">
              Buscar e-mail
            </label>
            <input
              id="admin-newsletter-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoComplete="off"
              className={`${fieldClass} block sm:max-w-sm`}
            />
          </div>

          <div aria-live="polite">
            {notice && <p className="rounded-sm border border-border bg-muted px-4 py-3 text-sm font-medium">{notice}</p>}
          </div>

          {visible.length === 0 ? (
            <p className="rounded-sm border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {term ? 'Nenhum e-mail encontrado.' : 'Ninguém se inscreveu ainda.'}
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-sm border border-border px-4 sm:px-5">
              {visible.map((subscriber) => (
                <SubscriberRow key={subscriber.email} subscriber={subscriber} onRemove={handleRemove} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

export default AdminNewsletterPage
