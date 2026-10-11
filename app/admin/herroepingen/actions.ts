"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelAndRefundOrder, refundWithdrawal, type RefundResult } from "@/lib/orders/refunds";

async function assertAdmin() {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");
}

function refresh(orderId: string) {
  revalidatePath("/admin/herroepingen");
  revalidatePath("/admin/bestellingen");
  revalidatePath(`/admin/bestellingen/${orderId}`);
  revalidatePath("/admin");
}

async function logAdminEvent(orderId: string, type: string, message: string) {
  await createAdminClient().from("OrderEvent").insert({ orderId, type, message, actor: "admin" });
}

async function getOrderIdOfWithdrawal(withdrawalId: string): Promise<string> {
  const { data, error } = await createAdminClient()
    .from("Withdrawal")
    .select("orderId")
    .eq("id", withdrawalId)
    .single();
  if (error) throw new Error(error.message);
  return data.orderId;
}

export async function markReturnReceived(withdrawalId: string): Promise<void> {
  await assertAdmin();

  const { data, error } = await createAdminClient()
    .from("Withdrawal")
    .update({ status: "return_received", returnReceivedAt: new Date().toISOString() })
    .eq("id", withdrawalId)
    .eq("status", "registered")
    .select("orderId");
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Deze herroeping werd intussen gewijzigd. Herlaad de pagina.");

  await logAdminEvent(data[0].orderId, "return_received", "Teruggestuurd werk ontvangen");
  refresh(data[0].orderId);
}

export async function refundWithdrawalAction(withdrawalId: string, makeAvailable: boolean): Promise<RefundResult> {
  await assertAdmin();

  const orderId = await getOrderIdOfWithdrawal(withdrawalId);
  try {
    return await refundWithdrawal(withdrawalId, makeAvailable);
  } finally {
    refresh(orderId);
  }
}

// E.g. withdrawn outside the period, or for custom work. Puts the order back
// in the state it had before the withdrawal.
export async function rejectWithdrawal(withdrawalId: string, note: string): Promise<void> {
  await assertAdmin();

  const trimmed = note.trim();
  if (!trimmed) throw new Error("Geef een reden op; die heb je nodig als de klant vragen stelt.");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("Withdrawal")
    .update({ status: "rejected", adminNote: trimmed.slice(0, 2000) })
    .eq("id", withdrawalId)
    .in("status", ["registered", "return_received"])
    .select("orderId");
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Deze herroeping werd intussen gewijzigd. Herlaad de pagina.");

  const orderId = data[0].orderId;
  const { data: order } = await supabase
    .from("Order")
    .select("status, shippedAt, deliveredAt")
    .eq("id", orderId)
    .single();
  if (order?.status === "withdrawn") {
    const previous = order.deliveredAt ? "delivered" : order.shippedAt ? "shipped" : "paid";
    await supabase.from("Order").update({ status: previous }).eq("id", orderId);
  }

  await logAdminEvent(orderId, "withdrawal_rejected", `Herroeping afgewezen: ${trimmed}`);
  refresh(orderId);
}

export async function cancelAndRefundOrderAction(orderId: string, makeAvailable: boolean): Promise<RefundResult> {
  await assertAdmin();

  const { data: refunds, error } = await createAdminClient()
    .from("Refund")
    .select("id")
    .eq("orderId", orderId)
    .neq("status", "failed");
  if (error) throw new Error(error.message);
  if (refunds?.length) {
    throw new Error("Voor deze bestelling werd al (deels) terugbetaald. Volledig annuleren kan niet meer.");
  }

  try {
    const result = await cancelAndRefundOrder(orderId, makeAvailable);
    // Shown as "Geannuleerd" in the customer's timeline
    await createAdminClient().from("Order").update({ cancelledAt: new Date().toISOString() }).eq("id", orderId);
    await logAdminEvent(orderId, "cancelled_by_admin", "Bestelling geannuleerd en volledig terugbetaald door de admin");
    return result;
  } finally {
    refresh(orderId);
  }
}
