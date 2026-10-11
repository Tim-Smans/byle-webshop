"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelOrderAsCustomer, CancelNotPossibleError } from "@/lib/orders/customer-cancel";
import { formatPrice } from "@/lib/utils";

export type CancelResult = { ok: true; amountLabel: string } | { ok: false; message: string };

const clean = (value: unknown, max = 200) => (typeof value === "string" ? value.trim().slice(0, max) : "");

// The customer proves the order is theirs with the secret link token, or
// with the order number plus the e-mail address used to order
export async function cancelMyOrder(raw: Record<string, unknown>): Promise<CancelResult> {
  const orderNumber = clean(raw.orderNumber, 40).toUpperCase();
  const token = clean(raw.token, 100);
  const email = clean(raw.email).toLowerCase();
  if (!orderNumber || (!token && !email)) return { ok: false, message: "Bestelling niet gevonden." };

  const { data: order, error } = await createAdminClient()
    .from("Order")
    .select("id, accessToken, customerEmail")
    .eq("orderNumber", orderNumber)
    .maybeSingle();
  if (error) return { ok: false, message: "Er ging iets mis. Probeer het opnieuw." };

  const owns =
    !!order &&
    ((token && token === order.accessToken) || (email && email === order.customerEmail.toLowerCase()));
  if (!order || !owns) return { ok: false, message: "Bestelling niet gevonden." };

  try {
    const { amount } = await cancelOrderAsCustomer(order.id);
    revalidatePath(`/bestelling/${orderNumber}`);
    return { ok: true, amountLabel: formatPrice(amount) };
  } catch (err) {
    if (err instanceof CancelNotPossibleError) return { ok: false, message: err.message };
    console.error("[cancel] unexpected error:", err);
    return { ok: false, message: "Er ging iets mis. Neem contact op via byle.art@outlook.com." };
  }
}
