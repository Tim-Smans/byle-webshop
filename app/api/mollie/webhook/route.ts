import { syncMolliePayment } from "@/lib/orders/payment-sync"

// Mollie calls this with only the payment id (form-encoded "id=tr_..."). The
// real status is always fetched from Mollie, so the request body cannot be
// used to fake a payment.
export async function POST(request: Request) {
  const formData = await request.formData()
  const paymentId = formData.get("id")

  if (typeof paymentId !== "string" || !paymentId.startsWith("tr_")) {
    return new Response("Bad request", { status: 400 })
  }

  try {
    await syncMolliePayment(paymentId)
  } catch (error) {
    console.error("[mollie webhook]", paymentId, error)
    // Non-2xx makes Mollie retry later
    return new Response("Error", { status: 500 })
  }

  return new Response("OK", { status: 200 })
}
