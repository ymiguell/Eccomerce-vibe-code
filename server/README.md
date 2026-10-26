# API — Montreal Moda e Casa

Backend da loja em **Node.js + Fastify + PostgreSQL (Prisma)**, seguindo a mesma Clean Architecture do front.

## Como rodar

Requisitos: Node.js 22.18 ou superior e Docker Desktop aberto.

```bash
cd server
cp .env.example .env   # configurações locais (o .env não vai para o Git)
npm install            # instala e gera o cliente do Prisma
npm run db:up          # sobe o PostgreSQL no Docker
npm run db:migrate     # cria as tabelas
npm run db:seed        # preenche o catálogo (81 produtos, 10 banners) e os cupons
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
| `npm run db:seed` | Preenche/atualiza catálogo e cupons com `prisma/seed/*.json` (pode rodar de novo sem duplicar; volta o estoque ao valor do arquivo) |

## Estrutura

```
src/
├── domain/          regras de negócio: produto, banner, cupom, itens e pedido, pagamento, frete
├── application/     casos de uso: listProducts, getProduct, listBanners, getCoupon, placeOrder, checkHealth
├── infrastructure/  banco de dados (Prisma): conexão e repositórios
├── http/            Fastify: app.js (CORS, erros), routes/ e schemas/ (validação e formato das respostas)
├── config/          leitura das variáveis de ambiente
└── server.js        liga tudo e sobe a API (como o App.jsx do front)
prisma/              estrutura do banco, migrações e seed (dados iniciais do catálogo)
test/                testes com node:test
```

## Rotas

| Método | Rota | Resposta |
|---|---|---|
| GET | `/health` | 200 se a API e o banco estão no ar; 503 se o banco não responde |
| GET | `/products` | Catálogo. Filtros opcionais: `niche` (moda, casa, tecnologia, saude), `featured=true`, `onSale=true` |
| GET | `/products/:id` | Um produto; 404 `product_not_found` se não existir |
| GET | `/banners?placement=home` | Banners da página (home, moda, casa, tecnologia, saude, outlet) + os de todas as páginas |
| GET | `/coupons/:code` | Cupom ativo (sem diferenciar maiúsculas); 404 `coupon_not_found` |
| POST | `/orders` | Cria o pedido (201). Veja abaixo |

### POST /orders

O navegador manda só as escolhas do cliente; **preços, cupom, frete, desconto do Pix e total são recalculados no servidor**
com os dados do banco, e o estoque é baixado na mesma transação que grava o pedido.

```json
{
  "items": [{ "productId": "air-fryer-oven-philco-11l", "size": null, "color": "Preto", "quantity": 1 }],
  "couponCode": "BEMVINDO10",
  "customer": { "name": "Ana Silva", "email": "ana@exemplo.com", "phone": "11900000000" },
  "address": { "cep": "01310100", "street": "Av. Paulista", "number": "1000", "complement": "", "neighborhood": "Bela Vista", "city": "São Paulo", "state": "SP" },
  "payment": { "method": "pix" },
  "expectedTotal": 470.16
}
```

`expectedTotal` é o total que o cliente viu: se não bater com o recalculado, o pedido não é gravado.

| Status | `error` | Quando |
|---|---|---|
| 422 | `invalid_data` (+ `fields`) | Nome, e-mail, telefone, endereço ou parcelas inválidos |
| 422 | `product_not_found` / `invalid_item` | Produto inexistente; tamanho, cor ou quantidade inválidos |
| 422 | `invalid_coupon` / `coupon_min_subtotal` | Cupom inexistente/desativado; valor mínimo não atingido |
| 409 | `out_of_stock` (+ `productId`) | Estoque insuficiente (inclusive se outro cliente levou a última unidade) |
| 409 | `price_changed` (+ `total`) | O total mudou desde que o cliente abriu a página |

Fotos e artes ficam no site (`src/assets/images/`); a API devolve só o nome do arquivo em `image`/`mobileImage`.

Erros seguem sempre o formato `{ "error": "codigo", "message": "texto" }`.
