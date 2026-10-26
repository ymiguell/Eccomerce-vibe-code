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
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  })
}
