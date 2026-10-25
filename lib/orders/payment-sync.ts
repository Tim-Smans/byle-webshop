import "server-only"
import { PaymentStatus } from "@mollie/api-client"
import { getMollieClient } from "../mollie/client"
import { createAdminClient } from "../supabase/admin"
import { SOLD_COLLECTION_ID } from "../services/art-piece-service"
import { ensureInvoiceForOrder } from "../invoicing/invoice-service"
import { sendOrderConfirmation } from "../email/order-emails"

// Fetches the payment's real status from Mollie and applies it to the order.
// Idempotent: safe to call from the webhook and the thank-you page, as often
// as needed. Never trusts anything but Mollie's own answer.
export async function syncMolliePayment(molliePaymentId: string): Promise<void> {
  const supabase = createAdminClient()

  const { data: paymentRow, error: lookupError } = await supabase
    .from("Payment")
    .select("id, orderId, status")
    .eq("molliePaymentId", molliePaymentId)
    .maybeSingle()
  if (lookupError) throw new Error(lookupError.message)

  // Not one of ours (or created by another environment): ignore
  if (!paymentRow) return

  const payment = await getMollieClient().payments.get(molliePaymentId)

  const { error: updateError } = await supabase
    .from("Payment")
    .update({
      status: payment.status,
      method: payment.method ?? null,
      raw: {
        status: payment.status,
        method: payment.method,
        paidAt: payment.paidAt,
        expiredAt: payment.expiredAt,
        canceledAt: payment.canceledAt,
        failedAt: payment.failedAt,
      },
    })
    .eq("id", paymentRow.id)
  if (updateError) throw new Error(updateError.message)

  switch (payment.status) {
    case PaymentStatus.paid: {
      const { error } = await supabase.rpc("mark_order_paid", {
        p_order_id: paymentRow.orderId,
        p_sold_collection_id: SOLD_COLLECTION_ID,
      })
      if (error) throw new Error(error.message)

      // Idempotent. If this fails, the error makes Mollie retry the webhook;
      // the admin can also create missing invoices by hand.
      await ensureInvoiceForOrder(paymentRow.orderId)
      // Also idempotent; a failure makes Mollie retry and send it then
      await sendOrderConfirmation(paymentRow.orderId)
      break
    }
    case PaymentStatus.expired:
    case PaymentStatus.failed: {
      const { error } = await supabase.rpc("release_order", {
        p_order_id: paymentRow.orderId,
        p_new_status: "expired",
      })
      if (error) throw new Error(error.message)
      break
    }
    case PaymentStatus.canceled: {
      const { error } = await supabase.rpc("release_order", {
        p_order_id: paymentRow.orderId,
        p_new_status: "cancelled",
      })
      if (error) throw new Error(error.message)
      break
    }
    // open, pending, authorized: still waiting
  }
}
