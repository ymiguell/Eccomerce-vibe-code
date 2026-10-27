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
npm run db:seed        # preenche catálogo (81 produtos, 10 banners), cupons e avaliações de exemplo
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
| `npm run admin:grant -- email` / `admin:revoke -- email` | Dá / tira o acesso ao painel da loja (`/admin`) para uma conta já cadastrada |
| `npm run db:seed` | Preenche/atualiza catálogo, cupons e avaliações de exemplo com `prisma/seed/*.json` (pode rodar de novo sem duplicar; volta o estoque ao valor do arquivo) |

## Estrutura

```
src/
├── domain/          regras de negócio: produto, banner, cupom, itens e pedido, pagamento, frete, avaliação, conta
├── application/     casos de uso: catálogo, getCoupon, placeOrder, avaliações, newsletter, contas, checkHealth
├── infrastructure/  banco de dados (Prisma): conexão e repositórios; security/ (senhas e tokens de sessão)
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
| GET | `/products/:id/reviews` | Avaliações do produto, das mais recentes para as mais antigas |
| POST | `/products/:id/reviews` | Publica avaliação `{ author, rating, comment }` (201); 422 `invalid_data` com `fields` |
| POST | `/newsletter` | Inscreve `{ email }` (201); 409 `already_subscribed`; 422 `invalid_email` |

| POST | `/auth/register` | Cria a conta `{ name, email, password }` e já entra (201 `{ customer, token }`); 409 `email_taken` |
| POST | `/auth/login` | Entra `{ email, password }` (200 `{ customer, token }`); 401 `invalid_credentials` |
| POST | `/auth/logout` | Sai: apaga a sessão do token enviado (204) |
| GET | `/me` | Conta logada; 401 `unauthorized` sem login |
| PATCH | `/me` | Atualiza `{ name, phone }` |
| GET | `/me/orders` | Pedidos feitos com a conta, do mais recente ao mais antigo |

**Painel da loja** (só contas da equipe; 401 `unauthorized` sem login, 403 `forbidden` para conta comum):

| Método | Rota | Resposta |
|---|---|---|
| GET | `/admin/orders?status=&page=` | Página de 20 pedidos (mais recentes primeiro) + `counts` por situação |
| PATCH | `/admin/orders/:id` | Muda a situação `{ status, trackingCode? }` (rastreio só ao enviar); 422 `invalid_transition`, 409 `status_changed` |
| PATCH | `/admin/orders/:id/tracking` | Informa ou corrige `{ trackingCode }` de pedido enviado (`null` apaga); 422 `not_shipped` |
| PATCH | `/admin/products/:id` | Edita `{ price, originalPrice, stock, isFeatured }` (só o que vier); `originalPrice: null` tira a promoção |
| GET | `/admin/coupons` | Todos os cupons, com `active` e `timesUsed` |
| POST | `/admin/coupons` | Cria `{ code, type, value, minSubtotal?, description? }` (201); 409 `code_taken` |
| PATCH | `/admin/coupons/:code` | Liga/desliga `{ active }` (não apaga: pedidos antigos apontam para o cupom) |
| GET | `/admin/reviews?visibility=&page=` | Avaliações de todos os produtos (20 por página) + `counts` visíveis/ocultas |
| PATCH | `/admin/reviews/:id` | Oculta ou mostra `{ hidden }`: oculta some da loja e não conta na nota |
| GET | `/admin/newsletter` | Inscritos na newsletter |
| DELETE | `/admin/newsletter/:email` | Tira o e-mail da lista, a pedido do cliente (204); 404 `subscriber_not_found` |

### Painel da loja

- Não existe tela para virar "equipe": a pessoa cria a conta no site e alguém com acesso ao servidor roda
  `npm run admin:grant -- email@exemplo.com` (e `npm run admin:revoke -- email@exemplo.com` para tirar).
- Caminhos da situação do pedido: aguardando pagamento → pago → enviado → entregue. Dá para cancelar enquanto
  não foi enviado, e **cancelar devolve os produtos ao estoque** (na mesma transação).
- Até o pagamento online chegar, a equipe marca "pago" à mão depois de conferir o Pix ou o cartão.
- Ao marcar como enviado, a equipe pode informar o código de rastreio; o cliente vê em "Minha conta".

### Contas e login

- O site manda o token no cabeçalho `Authorization: Bearer <token>`. Com ele, `POST /orders` liga o pedido à conta.
- Senhas guardadas com **scrypt** (nunca em texto). O banco guarda só o **hash SHA-256 do token** de sessão;
  a sessão vale 30 dias e sair a apaga.
- Login com e-mail inexistente ou senha errada dá a mesma resposta (e leva o mesmo tempo).
- Pedidos feitos sem login **não** são ligados à conta pelo e-mail: sem confirmação de e-mail, alguém poderia
  criar conta com o e-mail de outra pessoa e ver os pedidos dela.

**Limite de envios por visitante (IP):** `POST /orders` 10 por minuto; login 10; cadastro, avaliações e newsletter 5.
Acima disso a resposta é 429 `too_many_requests`. Na hospedagem, use `TRUST_PROXY=true` para o limite enxergar o IP real.

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
