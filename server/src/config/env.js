import { fileURLToPath } from 'node:url'

// Lê e confere as variáveis de ambiente uma vez, quando o servidor sobe. Modelo em .env.example.

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Variável de ambiente ${name} não definida (veja server/.env.example)`)
  return value
}

export function loadConfig() {
  return Object.freeze({
    port: Number(process.env.PORT ?? 3333),
    // Na hospedagem use HOST=0.0.0.0 para aceitar conexões de fora; localmente só a própria máquina
    host: process.env.HOST ?? 'localhost',
    databaseUrl: required('DATABASE_URL'),
    // Na hospedagem a API fica atrás de um proxy: TRUST_PROXY=true para enxergar o IP real de cada visitante
    trustProxy: process.env.TRUST_PROXY === 'true',
    // Endereço desta API na internet (sem / no fim): forma o link das fotos enviadas pelo painel
    publicUrl: (process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3333}`).replace(/\/+$/, ''),
    // Serviço de imagens (hospedagem). Sem ele, as fotos do painel ficam na pasta uploadsDir
    cloudinaryUrl: process.env.CLOUDINARY_URL || null,
    // Pasta das fotos enviadas pelo painel (ambiente local)
    uploadsDir: process.env.UPLOADS_DIR ?? fileURLToPath(new URL('../../uploads/', import.meta.url)),
    // Serviço de e-mail (hospedagem). Sem a chave, os e-mails aparecem no terminal da API
    brevoApiKey: process.env.BREVO_API_KEY || null,
    // Quem envia os e-mails da loja (precisa estar verificado no Brevo)
    emailFrom: { email: process.env.EMAIL_FROM ?? 'montrealmoda1@gmail.com', name: process.env.EMAIL_FROM_NAME ?? 'Montreal Moda e Casa' },
    // Endereço do site (sem / no fim): os links dos e-mails apontam para ele
    siteUrl: (process.env.SITE_URL ?? 'http://localhost:5173').replace(/\/+$/, ''),
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  })
}
