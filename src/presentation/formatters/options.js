const optionNames = { size: 'o tamanho', color: 'a cor' }

/** Texto de ajuda para as opções que faltam escolher, ex.: "Selecione o tamanho e a cor". */
export function describeMissingOptions(missing) {
  if (missing.length === 0) return ''
  return `Selecione ${missing.map((option) => optionNames[option]).join(' e ')}`
}
