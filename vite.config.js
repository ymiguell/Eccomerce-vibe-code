import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // No GitHub Pages o site fica em /<nome-do-repositório>/; a automação de deploy passa esse caminho.
  // Localmente (npm run dev) continua na raiz "/".
  base: process.env.BASE_PATH ?? '/',
})
