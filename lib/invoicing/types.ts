// Invoicing is a separate module: it only reads orders and never changes them.
// Invoices are immutable snapshots; corrections go through a credit note.

export type InvoiceType = "invoice" | "credit_note"

export interface InvoiceParty {
  name: string
  companyName?: string | null
  vatNumber?: string | null
  enterpriseNumber?: string | null
  street?: string | null
  postalCode?: string | null
  city?: string | null
  country?: string | null
  email?: string | null
  phone?: string | null
}

export interface InvoiceLine {
  kind: "item" | "shipping"
  orderItemId: string | null
  description: string
  quantity: number
  vatRate: number
  // Amounts are negative on a credit note
  totalInclVat: number
  totalExclVat: number
  vatAmount: number
}

export interface Invoice {
  id: string
  orderId: string
  orderNumber: string
  type: InvoiceType
  invoiceNumber: string
  creditedInvoiceNumber: string | null
  issuedAt: string
  seller: InvoiceParty
  buyer: InvoiceParty
  lines: InvoiceLine[]
  subtotalExclVat: number
  vatAmount: number
  total: number
}
