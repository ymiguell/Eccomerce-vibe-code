import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const FILE_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp)$/

/**
 * Guarda as fotos enviadas pelo painel numa pasta do servidor (`server/uploads/`), servida em /uploads/.
 * Serve para o ambiente local: na hospedagem os arquivos do servidor somem a cada deploy, então lá as fotos
 * vão para um serviço de imagens (mesmos métodos: save e isStored).
 * - `directory`: pasta onde os arquivos ficam.
 * - `publicUrl`: endereço da pasta na internet, ex.: http://localhost:3333/uploads.
 */
export class LocalImageStorage {
  #directory
  #publicUrl

  constructor({ directory, publicUrl }) {
    this.#directory = directory
    this.#publicUrl = publicUrl
  }

  /** Grava a imagem com um nome aleatório (nunca o nome original do arquivo) e devolve o endereço dela. */
  async save(bytes, extension) {
    await mkdir(this.#directory, { recursive: true })
    const fileName = `${randomUUID()}.${extension}`
    await writeFile(join(this.#directory, fileName), bytes)
    return `${this.#publicUrl}/${fileName}`
  }

  /** true se o endereço é de uma foto guardada aqui (o painel não aceita foto de outro site). */
  isStored(url) {
    return typeof url === 'string' && url.startsWith(`${this.#publicUrl}/`) && FILE_NAME.test(url.slice(this.#publicUrl.length + 1))
  }
}
