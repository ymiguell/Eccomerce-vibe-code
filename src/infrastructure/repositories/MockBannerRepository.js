import { ALL_PAGES, createBanner } from '../../domain/entities/Banner.js'
import { resolveBannerImage } from '../assets/catalogImages.js'

/*
 * Banners de exemplo, usados quando o site roda sem a API (sem VITE_API_URL).
 * Com a API, os banners vêm do banco (server/prisma/seed/banners.json). Campos (a ordem é a do carrossel):
 * - `placement`: página onde aparece ('home', 'moda', 'casa', 'tecnologia', 'saude', 'outlet') ou ALL_PAGES (todas).
 * - `image` / `mobileImage`: nome do arquivo em src/assets/images/banners/.
 *   Desktop: 1920 × 600 px (16:5). Celular: quadrada (ex.: 400 × 400). De preferência em .webp.
 * - `showText: false` quando a arte já traz o texto; o `title` vira o texto lido pelos leitores de tela.
 * - `ctaHref`: para onde o banner leva. Rotas internas começam com '/' (ex.: '/moda').
 * - Sem `image`, o banner é desenhado só com texto sobre uma cor sólida.
 */

// Banners da loja (montrealmodaecasa.com.br), exibidos em todas as páginas
const mockBanners = [
  {
    id: 'direto-da-fabrica',
    title: 'Direto da Fábrica pra sua casa: a partir de R$ 19,99, em até 10x sem juros no cartão Montreal',
    ctaLabel: 'Ver produtos para casa',
    ctaHref: '/casa',
    image: 'banner-01-desktop.webp',
    mobileImage: 'banner-01-mobile.webp',
  },
  {
    id: 'ironwear',
    title: 'Ironwear, marca exclusiva Montreal: peças a partir de R$ 19,99',
    ctaLabel: 'Ver moda',
    ctaHref: '/moda',
    image: 'banner-02-desktop.webp',
    mobileImage: 'banner-02-mobile.webp',
  },
  {
    id: 'eletroportateis',
    title: 'Eletroportáteis a partir de R$ 39,99, em até 10x sem juros e 5% no Pix',
    ctaLabel: 'Ver eletroportáteis',
    ctaHref: '/casa',
    image: 'banner-03-desktop.webp',
    mobileImage: 'banner-03-mobile.webp',
  },
  {
    id: 'relogios-smartwatches',
    title: 'Relógios e smartwatches a partir de R$ 159,99, em até 10x sem juros e 5% no Pix',
    ctaLabel: 'Ver relógios e smartwatches',
    ctaHref: '/tecnologia',
    image: 'banner-04-desktop.webp',
    mobileImage: 'banner-04-mobile.webp',
  },
  {
    id: 'primavera-verao',
    title: 'Nova coleção primavera-verão a partir de R$ 19,99',
    ctaLabel: 'Ver coleção',
    ctaHref: '/moda',
    image: 'banner-05-desktop.webp',
    mobileImage: 'banner-05-mobile.webp',
  },
  {
    id: 'smartphones',
    title: 'Smartphones a partir de R$ 999,99, em até 10x sem juros e 5% no Pix',
    ctaLabel: 'Ver smartphones',
    ctaHref: '/tecnologia',
    image: 'banner-06-desktop.webp',
    mobileImage: 'banner-06-mobile.webp',
  },
  {
    id: 'moda-feminina',
    title: 'Moda feminina a partir de R$ 19,99',
    ctaLabel: 'Ver moda feminina',
    ctaHref: '/moda',
    image: 'banner-07-desktop.webp',
    mobileImage: 'banner-07-mobile.webp',
  },
  {
    id: 'moda-masculina',
    title: 'Moda masculina a partir de R$ 19,99',
    ctaLabel: 'Ver moda masculina',
    ctaHref: '/moda',
    image: 'banner-08-desktop.webp',
    mobileImage: 'banner-08-mobile.webp',
  },
  {
    id: 'vai-de-jeans',
    title: 'Vai de jeans, vai de Montreal: peças a partir de R$ 39,99',
    ctaLabel: 'Ver jeans',
    ctaHref: '/moda',
    image: 'banner-09-desktop.webp',
    mobileImage: 'banner-09-mobile.webp',
  },
  {
    id: 'desconto-progressivo',
    title: 'Desconto progressivo em moda feminina, masculina e infantil: 15% em 2 peças, 20% em 3 e 30% em 4 ou mais',
    ctaLabel: 'Ver ofertas',
    ctaHref: '/outlet',
    image: 'banner-10-desktop.webp',
    mobileImage: 'banner-10-mobile.webp',
  },
].map((banner) => ({ placement: ALL_PAGES, showText: false, ...banner }))

/** Implementação com dados fixos. Depois pode ser trocada por uma que chama a API. */
export class MockBannerRepository {
  async getByPlacement(placement) {
    return mockBanners
      .filter((banner) => banner.placement === placement || banner.placement === ALL_PAGES)
      .map(({ image, mobileImage, ...data }) =>
        createBanner({ ...data, imageUrl: resolveBannerImage(image), mobileImageUrl: resolveBannerImage(mobileImage) }),
      )
  }
}
