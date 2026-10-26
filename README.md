# Eccomerce Vibe Code — Montreal Moda e Casa

Loja virtual de moda, casa, tecnologia e saúde feita com **React + Tailwind CSS**, seguindo **Clean Architecture**.

## Funcionalidades

- Home com carrossel de banners, destaques e carrosséis por categoria
- Páginas de nicho (Moda, Casa, Tecnologia, Saúde) com filtros, ordenação e "Carregar mais"
- Outlet com todos os produtos em promoção, separados por nicho
- Página do produto: galeria, tamanho/cor, cálculo de frete por CEP, avaliações e dúvidas frequentes
- Sacola lateral com quantidade, cupom de desconto, frete grátis progressivo e parcelamento, salva no navegador
- Checkout em 3 etapas (identificação, entrega com busca de endereço pelo CEP, pagamento via Pix ou cartão) e página de pedido confirmado
- Faixa com contagem regressiva para a Black Friday
- Layout responsivo (celular, tablet e desktop) e cuidados de acessibilidade

> Os produtos, avaliações e cupons são dados de exemplo (mock). Cupons para testar: `BEMVINDO10` e `VERAO20`.
> O checkout é de demonstração: nenhum valor é cobrado e nenhum dado de cartão é pedido.

## Como rodar

Requisito: Node.js 20 ou superior.

```bash
npm install
npm run dev      # ambiente de desenvolvimento em http://localhost:5173
npm run build    # gera a versão de produção em dist/
npm run lint     # verifica o código
```

### Backend (em construção)

A API fica na pasta [`server/`](server/README.md) (Node.js + Fastify + PostgreSQL).

Para o site usar a API (catálogo, cupons, pedidos, avaliações, newsletter e contas de cliente) em vez dos dados de exemplo, crie um `.env.local` na raiz com:

```
VITE_API_URL=http://localhost:3333
```

Sem essa variável (como no GitHub Pages hoje), o site continua com os dados de exemplo e a área de conta fica escondida.

## Estrutura (Clean Architecture)

```
src/
├── domain/          regras de negócio puras (produto, sacola, cupom, frete, pagamento, avaliações)
├── application/     casos de uso (buscar produtos, aplicar cupom, calcular frete...)
├── infrastructure/  repositórios com dados de exemplo (trocáveis por uma API)
├── presentation/    React: páginas, componentes, hooks e formatação
└── App.jsx          liga a infraestrutura aos casos de uso e define as rotas
```

As camadas internas nunca importam as externas: `presentation → application → domain` e `infrastructure → domain`.

## Publicação

A cada push na branch `main`, o GitHub Actions gera o site e publica no GitHub Pages (`.github/workflows/deploy.yml`).
