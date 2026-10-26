import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

// Parâmetros do scrypt (custo, bloco, paralelismo) e tamanho do resultado. Ficam gravados junto com o hash,
// então dá para aumentar o custo no futuro sem invalidar as senhas antigas.
const COST = 16384
const BLOCK_SIZE = 8
const PARALLELISM = 1
const KEY_LENGTH = 64

/**
 * Protege senhas com scrypt (já vem no Node): lento de propósito, para dificultar adivinhar senhas vazadas.
 * Formato guardado: scrypt$custo$bloco$paralelismo$sal$hash (sal e hash em base64).
 */
export class ScryptPasswordHasher {
  async hash(password) {
    const salt = randomBytes(16)
    const key = await scryptAsync(password, salt, KEY_LENGTH, { N: COST, r: BLOCK_SIZE, p: PARALLELISM })
    return ['scrypt', COST, BLOCK_SIZE, PARALLELISM, salt.toString('base64'), key.toString('base64')].join('$')
  }

  async verify(password, stored) {
    const [algorithm, cost, blockSize, parallelism, salt, expected] = stored.split('$')
    if (algorithm !== 'scrypt') return false

    const expectedKey = Buffer.from(expected, 'base64')
    const key = await scryptAsync(password, Buffer.from(salt, 'base64'), expectedKey.length, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallelism),
    })
    // Comparação em tempo constante: o tempo de resposta não revela quantos bytes bateram
    return timingSafeEqual(key, expectedKey)
  }
}
