import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../generated/prisma/client.ts'

/** Conexão com o PostgreSQL. Crie uma só por servidor: cada cliente abre o próprio pool de conexões. */
export function createPrismaClient(databaseUrl) {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })
}
