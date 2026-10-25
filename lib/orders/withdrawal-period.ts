// Statutory withdrawal period: 14 calendar days, starting the day after the
// customer received the goods. So the last day is delivery date + 14, until
// the end of that day (Belgian time).

export const WITHDRAWAL_DAYS = 14

const brusselsDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Brussels",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

// "YYYY-MM-DD" of a moment, in Belgian time
export function toBrusselsDateString(value: string | Date): string {
  return brusselsDate.format(new Date(value))
}

// Last day on which the customer can still withdraw ("YYYY-MM-DD"), or null
// when the work has not been delivered yet (then the period hasn't started)
export function getWithdrawalLastDay(deliveredAt: string | null): string | null {
  if (!deliveredAt) return null

  const [year, month, day] = toBrusselsDateString(deliveredAt).split("-").map(Number)
  const lastDay = new Date(Date.UTC(year, month - 1, day + WITHDRAWAL_DAYS))
  return lastDay.toISOString().slice(0, 10)
}

// Withdrawal is possible before delivery and until the end of the last day
export function isWithinWithdrawalPeriod(deliveredAt: string | null, now: Date = new Date()): boolean {
  const lastDay = getWithdrawalLastDay(deliveredAt)
  if (!lastDay) return true
  return toBrusselsDateString(now) <= lastDay
}

const DAY_MS = 24 * 60 * 60 * 1000

// The seller must refund within 14 days after the withdrawal was received
export function getRefundDeadline(submittedAt: string): Date {
  return new Date(new Date(submittedAt).getTime() + WITHDRAWAL_DAYS * DAY_MS)
}

// Whole days left until the refund deadline (negative when overdue)
export function daysUntilRefundDeadline(submittedAt: string, now: Date = new Date()): number {
  return Math.ceil((getRefundDeadline(submittedAt).getTime() - now.getTime()) / DAY_MS)
}

export function formatDateString(value: string): string {
  const [year, month, day] = value.split("-").map(Number)
  return new Intl.DateTimeFormat("nl-BE", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day))
  )
}
