import { formatDateString, getWithdrawalLastDay, isWithinWithdrawalPeriod } from "./withdrawal-period"

export type TimelineState = "done" | "current" | "upcoming"

export interface TimelineStep {
  label: string
  description: string
  date: string | null
  state: TimelineState
  trackingCode?: string
}

interface TimelineOrder {
  status: string
  shippingMethod: "ship" | "pickup"
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  trackingCode: string | null
  withdrawals: { submittedAt: string; status: string; refundedAt: string | null }[]
}

// The customer's view of where their order is. Only for paid orders.
export function buildOrderTimeline(order: TimelineOrder, deliveryTimeText: string, now: Date = new Date()): TimelineStep[] {
  if (!order.paidAt) return []

  const steps: TimelineStep[] = [
    {
      label: "Bestelling ontvangen",
      description: "Je betaling is binnen. Je kunstwerk wordt met zorg klaargemaakt.",
      date: order.paidAt,
      state: "done",
    },
  ]

  // Cancelled after payment (by the customer or by Art by Lé)
  if (order.cancelledAt && order.status === "refunded") {
    steps.push({
      label: "Geannuleerd",
      description: "Je bestelling is geannuleerd en het volledige bedrag werd terugbetaald.",
      date: order.cancelledAt,
      state: "done",
    })
    return steps
  }

  const isPickup = order.shippingMethod === "pickup"

  if (!isPickup) {
    steps.push({
      label: "Verzonden",
      description: order.shippedAt
        ? "Je kunstwerk is zorgvuldig verpakt en onderweg."
        : `Je kunstwerk wordt verpakt. ${deliveryTimeText}`,
      date: order.shippedAt,
      state: order.shippedAt ? "done" : "current",
      trackingCode: order.shippedAt && order.trackingCode ? order.trackingCode : undefined,
    })
  }

  steps.push({
    label: isPickup ? "Afgehaald" : "Geleverd",
    description: order.deliveredAt
      ? isPickup ? "Je hebt je kunstwerk afgehaald." : "Je kunstwerk is bij je aangekomen."
      : isPickup
        ? "Ik neem contact met je op om een moment af te spreken om je werk af te halen."
        : "Je pakket is onderweg naar jou.",
    date: order.deliveredAt,
    state: order.deliveredAt ? "done" : isPickup || order.shippedAt ? "current" : "upcoming",
  })

  const withdrawal = order.withdrawals.find((w) => w.status !== "rejected")
  if (withdrawal) {
    steps.push({
      label: "Herroepen",
      description: "Je herroeping is geregistreerd. Stuur het werk binnen 14 dagen terug.",
      date: withdrawal.submittedAt,
      state: "done",
    })
    steps.push({
      label: "Terugbetaald",
      description: withdrawal.refundedAt
        ? "Het bedrag werd terugbetaald met je oorspronkelijke betaalmiddel."
        : "Je krijgt je geld terug binnen 14 dagen na je herroeping.",
      date: withdrawal.refundedAt,
      state: withdrawal.refundedAt ? "done" : "current",
    })
    return steps
  }

  const lastDay = getWithdrawalLastDay(order.deliveredAt)
  const finished = !!lastDay && !isWithinWithdrawalPeriod(order.deliveredAt, now)
  steps.push({
    label: "Afgerond",
    description: finished
      ? "De bedenktijd is voorbij. Veel plezier met je kunstwerk!"
      : lastDay
        ? `Je hebt bedenktijd tot en met ${formatDateString(lastDay)}. Daarna is je bestelling afgerond.`
        : "Na de levering heb je nog 14 dagen bedenktijd.",
    date: null,
    state: finished ? "done" : order.deliveredAt ? "current" : "upcoming",
  })

  return steps
}
