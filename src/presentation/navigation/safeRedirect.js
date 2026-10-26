/**
 * Para onde voltar depois do login (ex.: /entrar?voltar=/checkout).
 * Só aceita caminhos internos: "/checkout" sim; "//site-falso.com" ou "https://..." não — senão um link
 * malicioso poderia mandar o cliente para outro site logo depois de ele digitar a senha.
 */
export function safeRedirect(path, fallback = '/minha-conta') {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return fallback
  return path
}
