import "server-only"
import { createAdminClient } from "../supabase/admin"
import { cancelAndRefundOrder } from "./refunds"
import { sendOrderCancelledEmails } from "../email/order-emails"

export class CancelNotPossibleError extends Error {}

// The customer cancels a paid order before it was shipped or picked up. It
// is refunded in full right away and the works go back on sale.
export async function cancelOrderAsCustomer(orderId: string): Promise<{ amount: number }> {
  const supabase = createAdminClient()

  const { data: refunds } = await supabase.from("Refund").select("id").eq("orderId", orderId).neq("status", "failed")
  if (refunds?.length) {
    throw new CancelNotPossibleError("Voor deze bestelling werd al een terugbetaling gedaan. Neem contact op.")
  }

  // Claim the order first. markOrderShipped / markOrderDelivered refuse an
  // order with cancelledAt set, so cancelling and shipping can't cross.
  const { data: claimed, error } = await supabase
    .from("Order")
    .update({ cancelledAt: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "paid")
    .is("cancelledAt", null)
    .select("id")
  if (error) throw new Error(error.message)
  if (!claimed?.length) {
    throw new CancelNotPossibleError(
      "Deze bestelling kan niet meer geannuleerd worden, omdat ze al verzonden of afgehaald is. Je kan ze wel herroepen."
    )
  }

  let amount: number
  try {
    const result = await cancelAndRefundOrder(orderId, true, { actor: "customer", skipRefundEmail: true })
    amount = result.amount
    if (result.warnings.length) console.warn("[cancel] warnings:", result.warnings)
  } catch (err) {
    // Nothing was refunded: release the claim so the order is handled as usual
    await supabase.from("Order").update({ cancelledAt: null }).eq("id", orderId).eq("status", "paid")
    console.error("[cancel] refund failed:", err)
    throw new CancelNotPossibleError(
      "Je bestelling kon niet automatisch geannuleerd worden. Neem contact op via byle.art@outlook.com, dan regel ik het meteen."
    )
  }

  await supabase.from("OrderEvent").insert({
    orderId,
    type: "cancelled_by_customer",
    message: "Bestelling geannuleerd door de klant vóór verzending",
    actor: "customer",
  })

  try {
    await sendOrderCancelledEmails(orderId, amount)
  } catch (err) {
    console.error("[cancel] e-mails failed:", err)
  }

  return { amount }
}
