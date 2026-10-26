import { createHash, randomBytes } from 'node:crypto'

/** Token de sessão: 32 bytes aleatórios (impossível de adivinhar), em texto seguro para URL e cabeçalho. */
export function generateSessionToken() {
  return randomBytes(32).toString('base64url')
}

/** O banco guarda só o hash do token: quem ler o banco não consegue usar a sessão de ninguém. */
export function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex')
}
