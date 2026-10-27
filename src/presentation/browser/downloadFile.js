/** Faz o navegador baixar um arquivo gerado na própria página (ex.: a planilha de inscritos). */
export function downloadFile(fileName, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName })
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
