// Dutch labels for Mollie values, shared by the dashboard components

const METHOD_LABELS: Record<string, string> = {
  bancontact: "Bancontact",
  creditcard: "Kredietkaart",
  applepay: "Apple Pay",
  googlepay: "Google Pay",
  ideal: "iDEAL",
  kbc: "KBC/CBC",
  belfius: "Belfius",
  paypal: "PayPal",
  banktransfer: "Overschrijving",
  giftcard: "Cadeaukaart",
  klarna: "Klarna",
  trustly: "Trustly",
  onbekend: "Onbekend",
}

export function methodLabel(method: string | null): string {
  if (!method) return "–"
  return METHOD_LABELS[method] ?? method
}

export type StatusTone = "good" | "progress" | "neutral" | "bad"

// Payment statuses: good / still busy / not completed / failed
export const PAYMENT_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  paid: { label: "Betaald", tone: "good" },
  open: { label: "Open", tone: "progress" },
  pending: { label: "In behandeling", tone: "progress" },
  authorized: { label: "Geautoriseerd", tone: "progress" },
  expired: { label: "Verlopen", tone: "neutral" },
  canceled: { label: "Geannuleerd", tone: "neutral" },
  failed: { label: "Mislukt", tone: "bad" },
}

export const REFUND_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  queued: { label: "In wachtrij", tone: "progress" },
  pending: { label: "In behandeling", tone: "progress" },
  processing: { label: "Wordt verwerkt", tone: "progress" },
  refunded: { label: "Terugbetaald", tone: "good" },
  failed: { label: "Mislukt", tone: "bad" },
  canceled: { label: "Geannuleerd", tone: "neutral" },
  creating: { label: "Bezig", tone: "progress" },
}

export const TONE_CLASSES: Record<StatusTone, string> = {
  good: "bg-emerald-100 text-emerald-800",
  progress: "bg-amber-100 text-amber-800",
  neutral: "bg-muted text-muted-foreground",
  bad: "bg-red-100 text-red-800",
}
