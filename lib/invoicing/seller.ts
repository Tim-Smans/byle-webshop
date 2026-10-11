import type { InvoiceParty } from "./types"

// Printed on every invoice. Stored as a snapshot per invoice, so changing
// this later never alters invoices that were already issued.
export const SELLER: InvoiceParty = {
  name: "Art by Lé",
  street: "Hei-Ende 102",
  postalCode: "2340",
  city: "Vlimmeren (Beerse)",
  country: "België",
  vatNumber: "BE 1043.462.454",
  enterpriseNumber: "1043.462.454",
  email: "byle.art@outlook.com",
  phone: "+32 491 364 332",
}
