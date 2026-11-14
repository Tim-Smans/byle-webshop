// Belgian local time <-> ISO instants, without a date library.
// The admin enters times as they see them on the clock in Belgium.

const TIME_ZONE = "Europe/Brussels"

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})

function brusselsParts(utcMs: number) {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(new Date(utcMs)).map((part) => [part.type, part.value])
  )
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  }
}

// Difference between Belgian time and UTC at that moment, in ms
function offsetMs(utcMs: number): number {
  const p = brusselsParts(utcMs)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return asUtc - Math.floor(utcMs / 1000) * 1000
}

const LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/

// "2026-11-20T23:59" (or "2026-11-20") in Belgian time -> ISO string, or null
export function brusselsLocalToIso(local: string): string | null {
  const match = LOCAL_PATTERN.exec(local.trim())
  if (!match) return null
  const [, y, m, d, h = "00", mi = "00"] = match
  const guess = Date.UTC(Number(y), Number(m) - 1, Number(d), Number(h), Number(mi))
  if (Number.isNaN(guess)) return null

  let utc = guess - offsetMs(guess)
  // Around a DST switch the offset can differ at the corrected moment
  const second = guess - offsetMs(utc)
  if (second !== utc) utc = second
  return new Date(utc).toISOString()
}

// ISO string -> "2026-11-20T23:59" in Belgian time, for <input type="datetime-local">
export function isoToBrusselsLocal(iso: string): string {
  const p = brusselsParts(new Date(iso).getTime())
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`
}

// End of a Belgian calendar day ("2026-11-20" -> 21 Nov 00:00 Belgian time)
export function endOfBrusselsDay(date: string): string | null {
  const start = brusselsLocalToIso(date)
  if (!start) return null
  const next = new Date(new Date(start).getTime() + 36 * 3600 * 1000)
  const p = brusselsParts(next.getTime())
  const pad = (n: number) => String(n).padStart(2, "0")
  return brusselsLocalToIso(`${p.year}-${pad(p.month)}-${pad(p.day)}`)
}

// "YYYY-MM-DD" of today in Belgium
export function brusselsToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date())
}
