import type { InvoiceLine } from "./types"

const round2 = (value: number) => Math.round(value * 100) / 100

// Prices are entered incl. VAT; derive the excl. VAT and VAT parts per line
export function makeLine(
  kind: InvoiceLine["kind"],
  orderItemId: string | null,
  description: string,
  totalInclVat: number,
  vatRate: number
): InvoiceLine {
  const totalExclVat = round2(totalInclVat / (1 + vatRate / 100))
  return {
    kind,
    orderItemId,
    description,
    quantity: 1,
    vatRate,
    totalInclVat: round2(totalInclVat),
    totalExclVat,
    vatAmount: round2(totalInclVat - totalExclVat),
  }
}

export function negateLine(line: InvoiceLine): InvoiceLine {
  return {
    ...line,
    totalInclVat: -line.totalInclVat,
    totalExclVat: -line.totalExclVat,
    vatAmount: -line.vatAmount,
  }
}

export function sumLines(lines: InvoiceLine[]) {
  return {
    subtotalExclVat: round2(lines.reduce((sum, line) => sum + line.totalExclVat, 0)),
    vatAmount: round2(lines.reduce((sum, line) => sum + line.vatAmount, 0)),
    total: round2(lines.reduce((sum, line) => sum + line.totalInclVat, 0)),
  }
}

// VAT summary per rate, as required on the invoice
export function vatBreakdown(lines: InvoiceLine[]) {
  const byRate = new Map<number, { base: number; vat: number }>()
  for (const line of lines) {
    const entry = byRate.get(line.vatRate) ?? { base: 0, vat: 0 }
    entry.base = round2(entry.base + line.totalExclVat)
    entry.vat = round2(entry.vat + line.vatAmount)
    byRate.set(line.vatRate, entry)
  }
  return [...byRate.entries()]
    .sort(([a], [b]) => b - a)
    .map(([rate, { base, vat }]) => ({ rate, base, vat }))
}
