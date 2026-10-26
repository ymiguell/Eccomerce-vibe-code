import { isValidEmail } from '../valueObjects/Email.js'
import { isValidPhone } from '../valueObjects/Phone.js'

/*
 * Conta de cliente (login com e-mail e senha). Regras do cadastro, do login e do perfil.
 * Cada função retorna um objeto { campo: mensagem } — vazio quando está tudo certo.
 */
export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 128

const hasFullName = (name) => name.trim().split(/\s+/).length >= 2

/** Senha com 8+ caracteres, pelo menos uma letra e um número. */
export function validatePassword(password = '') {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
  if (password.length > MAX_PASSWORD_LENGTH) return `Use no máximo ${MAX_PASSWORD_LENGTH} caracteres.`
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return 'Use letras e números.'
  return null
}

export function validateRegistration({ name = '', email = '', password = '' }) {
  const errors = {}
  if (!hasFullName(name)) errors.name = 'Informe nome e sobrenome.'
  if (!isValidEmail(email)) errors.email = 'Informe um e-mail válido, ex.: nome@email.com.'
  const passwordError = validatePassword(password)
  if (passwordError) errors.password = passwordError
  return errors
}

/** No login só conferimos se veio algo: a mensagem de erro não pode dizer qual dos dois está errado. */
export function validateLogin({ email = '', password = '' }) {
  const errors = {}
  if (!isValidEmail(email)) errors.email = 'Informe um e-mail válido, ex.: nome@email.com.'
  if (!password) errors.password = 'Informe sua senha.'
  return errors
}

/** Perfil: nome obrigatório; celular é opcional, mas se vier precisa ser válido. */
export function validateProfile({ name = '', phone = '' }) {
  const errors = {}
  if (!hasFullName(name)) errors.name = 'Informe nome e sobrenome.'
  if (phone.trim() && !isValidPhone(phone)) errors.phone = 'Informe o celular com DDD (10 ou 11 números).'
  return errors
}
