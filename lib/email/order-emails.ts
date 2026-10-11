import "server-only"
import { createAdminClient } from "../supabase/admin"
import { getSiteUrl, DELIVERY_TIME_TEXT, PICKUP_LOCATION_TEXT } from "../shop/config"
import { ensureInvoiceForOrder, getInvoice } from "../invoicing/invoice-service"
import { invoiceFileName, renderInvoicePdf } from "../invoicing/invoice-pdf"
import { renderWithdrawalFormPdf, WITHDRAWAL_FORM_FILENAME } from "../legal/withdrawal-form-pdf"
import { renderTermsPdf, TERMS_PDF_FILENAME } from "../legal/terms-pdf"
import { ADMIN_EMAIL, sendEmail, type EmailAttachment } from "./send"
import { loadEmailOrder, type EmailOrder } from "./order-data"
import OrderConfirmationEmail from "./templates/order-confirmation"
import AdminNewOrderEmail from "./templates/admin-new-order"
import OrderShippedEmail from "./templates/order-shipped"

function orderLinks(order: EmailOrder) {
  const site = getSiteUrl()
  const query = `t=${order.accessToken}`
  return {
    orderUrl: `${site}/bestelling/${order.orderNumber}?${query}`,
    withdrawUrl: `${site}/herroepen?bestelling=${order.orderNumber}&${query}`,
    termsUrl: `${site}/voorwaarden`,
    adminUrl: `${site}/admin/bestellingen/${order.id}`,
  }
}

async function hasEvent(orderId: string, type: string): Promise<boolean> {
  const { data, error } = await createAdminClient()
    .from("OrderEvent")
    .select("id")
    .eq("orderId", orderId)
    .eq("type", type)
    .limit(1)
  if (error) throw new Error(error.message)
  return (data ?? []).length > 0
}

async function logEvent(orderId: string, type: string, message: string) {
  const { error } = await createAdminClient()
    .from("OrderEvent")
    .insert({ orderId, type, message, actor: "system" })
  if (error) throw new Error(error.message)
}

// Order confirmation to the customer (with invoice and model withdrawal form)
// plus a notification to Lé. Sent once: later calls are no-ops, and Resend's
// idempotency key covers two calls racing each other.
// With force (admin "send again") it is sent even if it went out before.
export async function sendOrderConfirmation(orderId: string, options: { force?: boolean } = {}): Promise<void> {
  if (!options.force && (await hasEvent(orderId, "confirmation_sent"))) return
  const keySuffix = options.force ? `/${Date.now()}` : ""

  const order = await loadEmailOrder(orderId)
  const links = orderLinks(order)

  // A work was sold to someone else in the meantime: don't tell the customer
  // it's on its way. Lé gets the warning and contacts them personally.
  if (order.hasStockConflict) {
    await sendAdminNewOrder(order, links.adminUrl)
    await logEvent(orderId, "confirmation_sent", "Geen bevestiging naar de klant: voorraadconflict, Lé neemt contact op")
    return
  }

  const invoice = await getInvoice(await ensureInvoiceForOrder(orderId))
  const attachments: EmailAttachment[] = []
  if (invoice) {
    attachments.push({ filename: invoiceFileName(invoice), content: await renderInvoicePdf(invoice) })
  }
  // The terms on a durable medium, as required for distance contracts
  attachments.push({ filename: TERMS_PDF_FILENAME, content: await renderTermsPdf() })
  if (order.items.some((item) => item.withdrawalApplicable)) {
    attachments.push({ filename: WITHDRAWAL_FORM_FILENAME, content: await renderWithdrawalFormPdf() })
  }

  await sendEmail({
    to: order.customerEmail,
    subject: `Bevestiging van je bestelling ${order.orderNumber} – Art by Lé`,
    react: OrderConfirmationEmail({
      order,
      orderUrl: links.orderUrl,
      withdrawUrl: links.withdrawUrl,
      termsUrl: links.termsUrl,
      deliveryTimeText: DELIVERY_TIME_TEXT,
      pickupLocationText: PICKUP_LOCATION_TEXT,
    }),
    attachments,
    replyTo: ADMIN_EMAIL,
    idempotencyKey: `order-confirmation/${orderId}${keySuffix}`,
  })
  await logEvent(orderId, "confirmation_sent", `Bevestiging verzonden naar ${order.customerEmail}`)

  // Lé already knows about the order when the customer mail is resent
  if (!options.force) await sendAdminNewOrder(order, links.adminUrl)
}

// A failing notification to Lé must not block or repeat the customer e-mail
async function sendAdminNewOrder(order: EmailOrder, adminUrl: string) {
  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `${order.hasStockConflict ? "⚠️ Terugbetaling nodig – " : ""}Nieuwe bestelling ${order.orderNumber}`,
      react: AdminNewOrderEmail({ order, adminUrl }),
      replyTo: order.customerEmail,
      idempotencyKey: `admin-new-order/${order.id}`,
    })
  } catch (error) {
    console.error("[email] admin notification failed:", error)
  }
}

export async function sendOrderShippedEmail(orderId: string): Promise<void> {
  const order = await loadEmailOrder(orderId)
  const links = orderLinks(order)

  await sendEmail({
    to: order.customerEmail,
    subject: `Je kunstwerk is onderweg – bestelling ${order.orderNumber}`,
    react: OrderShippedEmail({ order, orderUrl: links.orderUrl, withdrawUrl: links.withdrawUrl }),
    replyTo: ADMIN_EMAIL,
    idempotencyKey: `order-shipped/${orderId}`,
  })
  await logEvent(orderId, "shipped_email_sent", `Verzendmelding verzonden naar ${order.customerEmail}`)
}
