/**
 * Banner promocional de um carrossel (promoções sazonais, novidades...).
 * Entidade pura: não conhece React, API nem estilos.
 *
 * - `placement`: em qual página o banner aparece ('home', 'moda'...) ou ALL_PAGES para todas.
 * - `imageUrl`: imagem de fundo opcional; sem ela, o carrossel usa uma cor sólida.
 * - `mobileImageUrl`: versão da imagem para celular (opcional).
 * - `showText`: false quando a arte da imagem já traz o texto (o título vira só texto alternativo).
 */
export const ALL_PAGES = 'todas'

export function createBanner({
  id,
  placement,
  title,
  subtitle = '',
  ctaLabel,
  ctaHref,
  imageUrl = null,
  mobileImageUrl = null,
  showText = true,
}) {
  if (!id || !placement || !title || !ctaLabel || !ctaHref) {
    throw new Error('Banner inválido: id, placement, title, ctaLabel e ctaHref são obrigatórios')
  }

  return Object.freeze({ id, placement, title, subtitle, ctaLabel, ctaHref, imageUrl, mobileImageUrl, showText })
}
