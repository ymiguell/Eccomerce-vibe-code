/*
 * Libera (ou tira) o acesso ao painel da loja para uma conta já cadastrada no site.
 * Não existe tela para isso de propósito: só quem tem acesso ao servidor e ao banco promove alguém.
 *   npm run admin:grant -- ana@exemplo.com
 *   npm run admin:revoke -- ana@exemplo.com
 */
import { normalizeEmail } from '../src/domain/valueObjects/Email.js'
import { createPrismaClient } from '../src/infrastructure/database/prismaClient.js'
import { PrismaCustomerRepository } from '../src/infrastructure/repositories/PrismaCustomerRepository.js'

const args = process.argv.slice(2)
const email = args.find((arg) => !arg.startsWith('--'))
const isAdmin = !args.includes('--revoke')
if (!email) {
  console.error('Informe o e-mail da conta. Ex.: npm run admin:grant -- ana@exemplo.com')
  process.exit(1)
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definida (veja server/.env.example)')
  process.exit(1)
}

const prisma = createPrismaClient(process.env.DATABASE_URL)
const customer = await new PrismaCustomerRepository(prisma).setAdminByEmail(normalizeEmail(email), isAdmin)
await prisma.$disconnect()

if (!customer) {
  console.error(`Nenhuma conta com o e-mail ${email}. Crie a conta no site (/cadastro) e rode de novo.`)
  process.exit(1)
}
console.log(isAdmin ? `${customer.name} agora acessa o painel (/admin).` : `${customer.name} não acessa mais o painel.`)
