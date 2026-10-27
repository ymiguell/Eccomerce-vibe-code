/**
 * Planilha CSV no formato que o Excel brasileiro abre direto: colunas separadas por ";" e acentos preservados (BOM).
 * `columns`: [{ label, value: (linha) => texto }]
 */
export function toCsv(rows, columns) {
  const escape = (text) => {
    const value = String(text ?? '')
    return /[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
  }
  const lines = [columns.map((column) => escape(column.label)), ...rows.map((row) => columns.map((column) => escape(column.value(row))))]
  return `﻿${lines.map((line) => line.join(';')).join('\r\n')}`
}
