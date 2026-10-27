import { useEffect, useId, useState } from 'react'
import { PHOTO_TYPES, validatePhotoFile } from '../../../domain/entities/Product.js'
import { resizeImage } from '../../browser/resizeImage.js'

function PhotoIcon() {
  return (
    <svg className="size-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M21 16l-5-5-8 8" />
    </svg>
  )
}

/**
 * Escolha da foto de um produto, com prévia. A foto é reduzida no próprio navegador antes do envio
 * (resizeImage) e `onChange` recebe a imagem pronta (Blob).
 * - `name`: nome do campo no formulário (o useForm leva o foco até ele quando há erro).
 * - `currentUrl`: foto atual, ao editar um produto.
 * - `error`: erro vindo do formulário (ex.: foto obrigatória).
 */
function PhotoPicker({ name, label = 'Foto', currentUrl = null, error, onChange }) {
  const id = useId()
  const [preview, setPreview] = useState(null)
  const [preparing, setPreparing] = useState(false)
  const [fileError, setFileError] = useState('')

  // A prévia é um endereço temporário do navegador: liberado ao trocar de foto ou sair da tela
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  const handleFile = async (event) => {
    const file = event.target.files[0]
    // Limpa o campo: escolher o mesmo arquivo de novo também dispara a troca
    event.target.value = ''
    if (!file) return

    const invalid = validatePhotoFile(file)
    setFileError(invalid ?? '')
    if (invalid) return

    setPreparing(true)
    try {
      const photo = await resizeImage(file)
      setPreview(URL.createObjectURL(photo))
      onChange(photo)
    } catch {
      setFileError('Não conseguimos abrir esta foto. Tente outra.')
    } finally {
      setPreparing(false)
    }
  }

  const shown = preview ?? currentUrl
  const message = fileError || error
  const describedBy = [`${id}-hint`, message && `${id}-error`].filter(Boolean).join(' ')

  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-1.5 flex items-center gap-4">
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted sm:size-28">
          {shown ? <img src={shown} alt="Prévia da foto" className="size-full bg-white object-cover" /> : <PhotoIcon />}
        </div>

        <div className="min-w-0">
          {/* O campo de arquivo fica escondido; o rótulo faz o papel de botão e recebe o anel de foco do teclado */}
          <input
            id={id}
            name={name}
            type="file"
            accept={PHOTO_TYPES.join(',')}
            onChange={handleFile}
            disabled={preparing}
            aria-invalid={Boolean(message)}
            aria-describedby={describedBy}
            className="peer sr-only"
          />
          <label
            htmlFor={id}
            aria-busy={preparing}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-sm border border-border px-4 text-sm font-semibold transition-colors duration-200 hover:border-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-aria-invalid:border-primary"
          >
            {preparing ? 'Preparando foto…' : shown ? 'Trocar foto' : 'Escolher foto'}
          </label>
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted-foreground">
            JPG, PNG ou WebP. Quadrada e com fundo claro fica melhor na loja.
          </p>
        </div>
      </div>
      {message && (
        <p id={`${id}-error`} className="mt-1 text-sm text-primary">
          {message}
        </p>
      )}
    </div>
  )
}

export default PhotoPicker
