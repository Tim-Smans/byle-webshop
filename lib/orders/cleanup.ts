import "server-only"
import { createAdminClient } from "../supabase/admin"

// Retention promised in the privacy policy: orders that were never paid are
// deleted after 12 months. "expired" and "cancelled" only occur for unpaid
// orders (an order cancelled after payment becomes "refunded"), and they
// never have an invoice. Items, payments and events are deleted with them.
const UNPAID_RETENTION_MONTHS = 12

export async function deleteOldUnpaidOrders(): Promise<void> {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - UNPAID_RETENTION_MONTHS)

  const { error } = await createAdminClient()
    .from("Order")
    .delete()
    .in("status", ["expired", "cancelled"])
    .is("paidAt", null)
    .lt("createdAt", cutoff.toISOString())

  if (error) console.error("[cleanup] deleting old unpaid orders failed:", error)
}
