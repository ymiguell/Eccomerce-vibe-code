/** Moldura das páginas de entrar e criar conta: título, texto de apoio, formulário e rodapé com o outro caminho. */
function AuthCard({ title, description, footer, children }) {
  return (
    <main className="px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md rounded-sm border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 border-t border-border pt-5 text-center text-sm">{footer}</div>}
      </div>
    </main>
  )
}

export default AuthCard
