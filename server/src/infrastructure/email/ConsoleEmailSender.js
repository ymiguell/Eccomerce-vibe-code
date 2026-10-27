/**
 * "Envia" e-mails escrevendo no terminal da API. Serve para desenvolver e testar enquanto a loja não tem
 * um serviço de e-mail: o link de "esqueci minha senha" aparece no terminal onde roda `npm run dev`.
 */
export class ConsoleEmailSender {
  async send({ to, subject, text }) {
    const line = '─'.repeat(60)
    console.log(`\n${line}\nE-mail (não enviado de verdade: falta o serviço de e-mail)\nPara: ${to}\nAssunto: ${subject}\n\n${text}\n${line}\n`)
  }
}
