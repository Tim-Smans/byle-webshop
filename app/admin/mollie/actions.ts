"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMollieClient } from "@/lib/mollie/client";
import { syncMolliePayment } from "@/lib/orders/payment-sync";

async function assertAdmin() {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");
}

// Applies Mollie's status to these payments' orders (paid, invoice, e-mails),
// exactly like the webhook would
export async function syncPaymentsAction(paymentIds: string[]): Promise<{ synced: number; failed: string[] }> {
  await assertAdmin();

  const failed: string[] = [];
  let synced = 0;
  for (const id of paymentIds.filter((id) => /^tr_\w+$/.test(id)).slice(0, 50)) {
    try {
      await syncMolliePayment(id);
      synced += 1;
    } catch (err) {
      console.error("[mollie dashboard] sync failed:", id, err);
      failed.push(id);
    }
  }

  revalidatePath("/admin/mollie");
  revalidatePath("/admin/bestellingen");
  revalidatePath("/admin");
  return { synced, failed };
}

// Copies the current refund status from Mollie into the webshop, for every
// refund that is not final yet
export async function refreshRefundStatusesAction(): Promise<{ updated: number }> {
  await assertAdmin();

  const supabase = createAdminClient();
  const { data: rows, error } = await supabase
    .from("Refund")
    .select("id, mollieRefundId, status, Order (Payment (molliePaymentId, status))")
    .not("mollieRefundId", "is", null)
    .not("status", "in", "(refunded,failed,canceled)");
  if (error) throw new Error(error.message);

  let updated = 0;
  for (const row of rows ?? []) {
    const payments = ((row.Order as unknown as { Payment: { molliePaymentId: string; status: string }[] } | null)?.Payment ?? []);
    const paymentId = payments.find((p) => p.status === "paid")?.molliePaymentId;
    if (!paymentId || !row.mollieRefundId) continue;

    try {
      const refund = await getMollieClient().paymentRefunds.get(row.mollieRefundId, { paymentId });
      if (refund.status !== row.status) {
        await supabase.from("Refund").update({ status: refund.status }).eq("id", row.id);
        updated += 1;
      }
    } catch (err) {
      console.error("[mollie dashboard] refund refresh failed:", row.mollieRefundId, err);
    }
  }

  revalidatePath("/admin/mollie");
  return { updated };
}
