/*
 * Fotos de produtos e artes de banners ficam no próprio site (src/assets/images/), não na API.
 * A API e os mocks informam só o nome do arquivo; aqui ele vira o endereço final gerado pelo Vite.
 * Recomendado para produtos: imagem quadrada (1:1), .webp ou .jpg com até ~200 KB.
 */
const byFileName = (modules) =>
  Object.fromEntries(Object.entries(modules).map(([path, url]) => [path.split('/').pop(), url]))

const productImages = byFileName(
  import.meta.glob('../../assets/images/products/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }),
)
const bannerImages = byFileName(
  import.meta.glob('../../assets/images/banners/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }),
)

function resolve(images, folder, fileName) {
  if (!fileName) return null
  const url = images[fileName]
  // Arquivo que não existe vira "sem foto" (espaço reservado) em vez de quebrar a página
  if (!url) console.warn(`Imagem não encontrada: src/assets/images/${folder}/${fileName}`)
  return url ?? null
}

export const resolveProductImage = (fileName) => resolve(productImages, 'products', fileName)
export const resolveBannerImage = (fileName) => resolve(bannerImages, 'banners', fileName)
