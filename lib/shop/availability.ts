import type { Availability } from "../types"

interface AvailabilityFields {
  isSold: boolean
  status?: string | null
  reservedUntil?: string | null
}

export function getAvailability(piece: AvailabilityFields): Availability {
  if (piece.isSold || piece.status === "sold") return "sold"

  if (
    piece.status === "reserved" &&
    piece.reservedUntil &&
    new Date(piece.reservedUntil).getTime() > Date.now()
  ) {
    return "reserved"
  }

  return "available"
}
