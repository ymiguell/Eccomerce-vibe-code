import { existsSync } from 'node:fs'
import { defineConfig, env } from 'prisma/config'

// Os comandos do Prisma (migrate, generate) leem o .env local; em produção as variáveis vêm do servidor
if (existsSync('.env')) process.loadEnvFile('.env')

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
