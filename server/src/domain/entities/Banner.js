import { NICHES } from './Product.js'

/**
 * Banner promocional dos carrosséis. Entidade pura.
 * - `placement`: página onde aparece (ver PLACEMENTS) ou ALL_PAGES para todas.
 * - `image` / `mobileImage`: nomes dos arquivos (as artes ficam no site por enquanto).
 * - `showText`: false quando a arte já traz o texto.
 */
export const ALL_PAGES = 'todas'
export const PLACEMENTS = Object.freeze(['home', ...NICHES, 'outlet'])

export function createBanner({
  id,
  placement = ALL_PAGES,
  title,
  subtitle = '',
  ctaLabel,
  ctaHref,
  image = null,
  mobileImage = null,
  showText = true,
}) {
  if (!id || !title || !ctaLabel || !ctaHref) {
    throw new Error(`Banner inválido: id, title, ctaLabel e ctaHref são obrigatórios (${id})`)
  }

  if (placement !== ALL_PAGES && !PLACEMENTS.includes(placement)) {
    throw new Error(`Banner inválido: página "${placement}" não existe (${id})`)
  }

  return Object.freeze({ id, placement, title, subtitle, ctaLabel, ctaHref, image, mobileImage, showText })
}
