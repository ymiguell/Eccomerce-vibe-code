// Mensagens para os erros de login, cadastro e perfil (códigos da API e dos casos de uso)
const messages = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_taken: 'Já existe uma conta com este e-mail. Tente entrar.',
  too_many_requests: 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.',
  network_error: 'Não conseguimos falar com o servidor. Confira sua conexão e tente de novo.',
  unauthorized: 'Sua sessão terminou. Entre de novo para continuar.',
}

export function formatAuthError(code) {
  return messages[code] ?? 'Algo deu errado. Tente de novo em instantes.'
}
