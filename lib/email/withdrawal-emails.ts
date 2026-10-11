import "server-only"
import { createAdminClient } from "../supabase/admin"
import { getSiteUrl } from "../shop/config"
import { ADMIN_EMAIL, sendEmail } from "./send"
import type { EmailOrderItem } from "./templates/layout"
import WithdrawalReceivedEmail from "./templates/withdrawal-received"
import AdminNewWithdrawalEmail from "./templates/admin-new-withdrawal"
import RefundCompletedEmail from "./templates/refund-completed"

const dateTime = new Intl.DateTimeFormat("nl-BE", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Brussels",
})
const dateOnly = new Intl.DateTimeFormat("nl-BE", { dateStyle: "long", timeZone: "Europe/Brussels" })

// Confirmation to the customer (with date and time of receipt) and a
// notification to Lé
export async function sendWithdrawalEmails(withdrawalId: string): Promise<void> {
  const { data, error } = await createAdminClient()
    .from("Withdrawal")
    .select("id, orderId, name, email, reason, submittedAt, Order (orderNumber, customerEmail), WithdrawalItem (OrderItem (title, dimensions, imageUrl, price))")
    .eq("id", withdrawalId)
    .single()
  if (error) throw new Error(error.message)

  const order = data.Order as unknown as { orderNumber: string; customerEmail: string }
  const items = ((data.WithdrawalItem ?? []) as unknown as { OrderItem: EmailOrderItem }[]).map((link) => ({
    ...link.OrderItem,
    price: Number(link.OrderItem.price),
  }))
  const submittedAtLabel = dateTime.format(new Date(data.submittedAt))
  const refundDeadline = new Date(new Date(data.submittedAt).getTime() + 14 * 24 * 60 * 60 * 1000)

  // Sent to the address of the order and, when different, the one entered
  const recipients = [...new Set([order.customerEmail.toLowerCase(), data.email.toLowerCase()])]
  for (const to of recipients) {
    await sendEmail({
      to,
      subject: `Je herroeping voor bestelling ${order.orderNumber} is geregistreerd`,
      react: WithdrawalReceivedEmail({
        name: data.name,
        orderNumber: order.orderNumber,
        submittedAtLabel,
        items,
        reason: data.reason,
      }),
      replyTo: ADMIN_EMAIL,
      idempotencyKey: `withdrawal-received/${withdrawalId}/${to}`,
    })
  }

  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Herroeping voor bestelling ${order.orderNumber}`,
      react: AdminNewWithdrawalEmail({
        name: data.name,
        email: data.email,
        orderNumber: order.orderNumber,
        submittedAtLabel,
        refundDeadlineLabel: dateOnly.format(refundDeadline),
        items,
        reason: data.reason,
        adminUrl: `${getSiteUrl()}/admin/bestellingen/${data.orderId}`,
      }),
      replyTo: data.email,
      idempotencyKey: `admin-withdrawal/${withdrawalId}`,
    })
  } catch (err) {
    console.error("[email] admin withdrawal notification failed:", err)
  }
}

export async function sendRefundEmail(orderId: string, amount: number): Promise<void> {
  const { data: order, error } = await createAdminClient()
    .from("Order")
    .select("orderNumber, customerFirstName, customerEmail")
    .eq("id", orderId)
    .single()
  if (error) throw new Error(error.message)

  await sendEmail({
    to: order.customerEmail,
    subject: `Terugbetaling voor bestelling ${order.orderNumber}`,
    react: RefundCompletedEmail({ firstName: order.customerFirstName, orderNumber: order.orderNumber, amount }),
    replyTo: ADMIN_EMAIL,
  })
}
