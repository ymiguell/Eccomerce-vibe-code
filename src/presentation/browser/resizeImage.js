// Lado maior da foto enviada: nítida no zoom da página do produto e leve para carregar no celular
const MAX_SIDE = 1200
const QUALITY = 0.85

const toBlob = (canvas, type) => new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY))

/**
 * Prepara a foto escolhida para o envio: reduz para até 1200 px no lado maior e converte para WebP
 * (JPEG nos navegadores que não geram WebP). Redesenhar a imagem também descarta os dados da câmera,
 * como a localização onde a foto foi tirada. Fundo branco: PNG transparente não fica preto no JPEG.
 * Rejeita se o navegador não conseguir abrir a imagem.
 */
export async function resizeImage(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = Object.assign(document.createElement('canvas'), {
    width: Math.round(bitmap.width * scale),
    height: Math.round(bitmap.height * scale),
  })
  const context = canvas.getContext('2d')
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const webp = await toBlob(canvas, 'image/webp')
  return webp?.type === 'image/webp' ? webp : toBlob(canvas, 'image/jpeg')
}
