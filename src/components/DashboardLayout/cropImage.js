export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

// O avatar é exibido em no máximo ~70px; 512px cobre telas de alta densidade
// e mantém o arquivo em poucas dezenas de KB (o backend aceita até 2MB).
export const AVATAR_MAX_SIZE = 512
const AVATAR_JPEG_QUALITY = 0.9

export async function getCroppedImg(imageSrc, pixelCrop) {
  if (!pixelCrop || pixelCrop.width <= 0 || pixelCrop.height <= 0) return null

  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  // Reduz o recorte (nunca amplia) para no máximo AVATAR_MAX_SIZE no maior lado
  const scale = Math.min(1, AVATAR_MAX_SIZE / Math.max(pixelCrop.width, pixelCrop.height))
  canvas.width = Math.max(1, Math.round(pixelCrop.width * scale))
  canvas.height = Math.max(1, Math.round(pixelCrop.height * scale))

  // Fundo branco para evitar transparência convertida em fundo preto ao exportar JPEG
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file)
    }, 'image/jpeg', AVATAR_JPEG_QUALITY)
  })
}
