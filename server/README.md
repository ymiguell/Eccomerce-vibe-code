# API — Montreal Moda e Casa

Backend da loja em **Node.js + Fastify + PostgreSQL (Prisma)**, seguindo a mesma Clean Architecture do front.

## Como rodar

Requisitos: Node.js 22.18 ou superior e Docker Desktop aberto.

```bash
cd server
cp .env.example .env   # configurações locais (o .env não vai para o Git)
npm install            # instala e gera o cliente do Prisma
npm run db:up          # sobe o PostgreSQL no Docker
npm run dev            # API em http://localhost:3333 (reinicia sozinha ao salvar)
```

Teste: abra http://localhost:3333/health → `{"status":"ok","database":"up",...}`

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe a API em modo desenvolvimento |
| `npm test` | Roda os testes (não precisam do banco) |
| `npm run db:up` / `db:down` | Liga / desliga o PostgreSQL do Docker |
| `npm run db:migrate` | Aplica mudanças do `prisma/schema.prisma` no banco |

## Estrutura

```
src/
├── domain/          regras de negócio (entram nas próximas etapas)
├── application/     casos de uso, ex.: checkHealth
├── infrastructure/  banco de dados (Prisma) e serviços externos
├── http/            Fastify: app.js (CORS, erros) e routes/
├── config/          leitura das variáveis de ambiente
└── server.js        liga tudo e sobe a API (como o App.jsx do front)
prisma/              estrutura do banco e migrações
test/                testes com node:test
```

## Rotas

| Método | Rota | Resposta |
|---|---|---|
| GET | `/health` | 200 se a API e o banco estão no ar; 503 se o banco não responde |

Erros seguem sempre o formato `{ "error": "codigo", "message": "texto" }`.
