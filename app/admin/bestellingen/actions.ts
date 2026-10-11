"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmation, sendOrderShippedEmail } from "@/lib/email/order-emails";
import { toBrusselsDateString } from "@/lib/orders/withdrawal-period";

async function assertAdmin() {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");
}

async function logAdminEvent(orderId: string, type: string, message: string, data?: Record<string, unknown>) {
  const { error } = await createAdminClient()
    .from("OrderEvent")
    .insert({ orderId, type, message, actor: "admin", data: data ?? null });
  if (error) throw new Error(error.message);
}

function refresh(orderId: string) {
  revalidatePath("/admin/bestellingen");
  revalidatePath(`/admin/bestellingen/${orderId}`);
  revalidatePath("/admin");
}

export async function markOrderShipped(
  orderId: string,
  options: { trackingUrl: string; notifyCustomer: boolean }
): Promise<{ emailError?: string }> {
  await assertAdmin();

  const trackingUrl = options.trackingUrl.trim();
  if (trackingUrl && !/^https?:\/\/\S+$/i.test(trackingUrl)) {
    throw new Error("De trackinglink moet beginnen met http:// of https://");
  }

  // Only from "paid", so a double click can't ship twice
  const { data, error } = await createAdminClient()
    .from("Order")
    .update({ status: "shipped", shippedAt: new Date().toISOString(), trackingUrl: trackingUrl || null })
    .eq("id", orderId)
    .eq("status", "paid")
    .eq("shippingMethod", "ship")
    .select("id");
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Deze bestelling kan niet (meer) als verzonden worden aangeduid.");

  await logAdminEvent(orderId, "shipped", trackingUrl ? `Verzonden, tracking: ${trackingUrl}` : "Verzonden");
  refresh(orderId);

  if (options.notifyCustomer) {
    try {
      await sendOrderShippedEmail(orderId);
    } catch (err) {
      return { emailError: err instanceof Error ? err.message : "Verzendmelding niet verstuurd" };
    }
  }
  return {};
}

// Starts the 14-day withdrawal period. For pickup orders this is the pickup.
export async function markOrderDelivered(orderId: string, deliveredOn: string): Promise<void> {
  await assertAdmin();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(deliveredOn)) throw new Error("Ongeldige datum");
  if (deliveredOn > toBrusselsDateString(new Date())) throw new Error("De datum kan niet in de toekomst liggen");

  const supabase = createAdminClient();
  const { data: order, error: fetchError } = await supabase
    .from("Order")
    .select("status, paidAt, shippingMethod")
    .eq("id", orderId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const allowed = order.shippingMethod === "pickup" ? ["paid"] : ["paid", "shipped"];
  if (!allowed.includes(order.status)) {
    throw new Error("Deze bestelling kan niet (meer) als geleverd worden aangeduid.");
  }
  if (order.paidAt && deliveredOn < toBrusselsDateString(order.paidAt)) {
    throw new Error("De leverdatum kan niet vóór de betaling liggen");
  }

  // Noon UTC is the same calendar day in Belgium, summer and winter
  const { data, error } = await supabase
    .from("Order")
    .update({ status: "delivered", deliveredAt: `${deliveredOn}T12:00:00Z` })
    .eq("id", orderId)
    .in("status", allowed)
    .select("id");
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Deze bestelling werd intussen gewijzigd. Herlaad de pagina.");

  await logAdminEvent(
    orderId,
    "delivered",
    order.shippingMethod === "pickup" ? `Afgehaald op ${deliveredOn}` : `Geleverd op ${deliveredOn}`
  );
  refresh(orderId);
}

export async function saveOrderNote(orderId: string, note: string): Promise<void> {
  await assertAdmin();

  const { error } = await createAdminClient()
    .from("Order")
    .update({ adminNote: note.trim().slice(0, 5000) || null })
    .eq("id", orderId);
  if (error) throw new Error(error.message);

  refresh(orderId);
}

export async function resendOrderConfirmation(orderId: string): Promise<void> {
  await assertAdmin();

  const { data: order, error } = await createAdminClient()
    .from("Order")
    .select("paidAt")
    .eq("id", orderId)
    .single();
  if (error) throw new Error(error.message);
  if (!order.paidAt) throw new Error("Deze bestelling is niet betaald");

  await sendOrderConfirmation(orderId, { force: true });
  refresh(orderId);
}
