"use server";

import { Locale } from "@mollie/api-client";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMollieClient } from "@/lib/mollie/client";
import {
  normalizeCheckoutInput,
  validateCheckoutInput,
  type CheckoutErrors,
} from "@/lib/orders/checkout-validation";
import { getSiteUrl, RESERVATION_MINUTES, TERMS_VERSION, VAT_RATE } from "@/lib/shop/config";

export type PlaceOrderResult =
  | { ok: true; checkoutUrl: string; orderId: string; orderNumber: string; accessToken: string }
  | { ok: false; message: string; fieldErrors?: CheckoutErrors };

const RPC_ERRORS: Record<string, string> = {
  EMPTY_CART: "Je winkelmand is leeg.",
  UNKNOWN_ART_PIECE: "Een van de werken in je winkelmand bestaat niet meer. Kijk je winkelmand even na.",
  UNAVAILABLE:
    "Een van de werken in je winkelmand is intussen verkocht of wordt door iemand anders afgerekend. Kijk je winkelmand even na.",
  SHIPPING_COUNTRY: "Naar dit land kunnen we niet automatisch verzenden. Neem contact op voor een persoonlijke berekening.",
};

const GENERIC_ERROR = "Er ging iets mis bij het plaatsen van je bestelling. Probeer het opnieuw of neem contact op.";

// Only cancels an order that is still unpaid and whose secret token matches,
// so nobody can cancel someone else's checkout. Never blocks the new order.
async function cancelPreviousOrder(previous: unknown): Promise<void> {
  if (!previous || typeof previous !== "object") return;
  const { orderNumber, accessToken } = previous as Record<string, unknown>;
  if (typeof orderNumber !== "string" || typeof accessToken !== "string") return;

  try {
    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("Order")
      .select("id, Payment (molliePaymentId)")
      .eq("orderNumber", orderNumber)
      .eq("accessToken", accessToken)
      .eq("status", "pending_payment")
      .maybeSingle();
    if (!order) return;

    // Cancel the open Mollie payment where possible. If it still gets paid,
    // mark_order_paid flags the conflict for a refund.
    for (const { molliePaymentId } of (order.Payment ?? []) as { molliePaymentId: string }[]) {
      try {
        const payment = await getMollieClient().payments.get(molliePaymentId);
        if (payment.isCancelable) {
          await getMollieClient().payments.cancel(molliePaymentId);
        }
      } catch (err) {
        console.error("[checkout] could not cancel previous Mollie payment:", err);
      }
    }

    await supabase.rpc("release_order", { p_order_id: order.id, p_new_status: "cancelled" });
  } catch (err) {
    console.error("[checkout] could not cancel previous order:", err);
  }
}

export async function placeOrder(raw: Record<string, unknown>): Promise<PlaceOrderResult> {
  const input = normalizeCheckoutInput(raw);

  // Honeypot filled in: pretend nothing happened
  if (input.website) {
    return { ok: false, message: GENERIC_ERROR };
  }

  const fieldErrors = validateCheckoutInput(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Kijk de gemarkeerde velden even na.", fieldErrors };
  }

  const supabase = createAdminClient();

  // The customer abandoned an earlier checkout in this browser: cancel it so
  // its reservation doesn't block them
  await cancelPreviousOrder(raw.previousOrder);

  // Pickup orders have no shipping address, so the billing address (if any)
  // is always a separate one
  const billingSameAsShipping = input.shippingMethod === "ship" && input.billingSameAsShipping;

  const { data, error } = await supabase.rpc("create_order", {
    p_art_piece_ids: input.artPieceIds,
    p_customer: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      companyName: input.isCompany ? input.companyName : "",
      vatNumber: input.isCompany ? input.vatNumber : "",
      street: input.street,
      postalCode: input.postalCode,
      city: input.city,
      billingSameAsShipping,
      billingCountryCode: billingSameAsShipping ? "" : input.billingCountryCode,
      billingStreet: billingSameAsShipping ? "" : input.billingStreet,
      billingPostalCode: billingSameAsShipping ? "" : input.billingPostalCode,
      billingCity: billingSameAsShipping ? "" : input.billingCity,
    },
    p_shipping_method: input.shippingMethod,
    p_shipping_country_code: input.shippingMethod === "ship" ? input.countryCode : null,
    p_vat_rate: VAT_RATE,
    p_terms_version: TERMS_VERSION,
    p_reservation_minutes: RESERVATION_MINUTES,
  });

  if (error) {
    const known = RPC_ERRORS[error.message];
    if (!known) console.error("[checkout] create_order failed:", error);
    return { ok: false, message: known ?? GENERIC_ERROR };
  }

  const order = (Array.isArray(data) ? data[0] : data) as {
    orderId: string;
    orderNumber: string;
    accessToken: string;
    total: number;
  };

  const siteUrl = getSiteUrl();
  // Mollie cannot reach localhost; there the thank-you page syncs the status
  const isPublicUrl = !/\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(siteUrl);

  try {
    const payment = await getMollieClient().payments.create({
      amount: { currency: "EUR", value: Number(order.total).toFixed(2) },
      description: `Art by Lé – bestelling ${order.orderNumber}`,
      redirectUrl: `${siteUrl}/bestelling/${order.orderNumber}?t=${order.accessToken}`,
      ...(isPublicUrl ? { webhookUrl: `${siteUrl}/api/mollie/webhook` } : {}),
      locale: Locale.nl_BE,
      metadata: { orderId: order.orderId, orderNumber: order.orderNumber },
    });

    const { error: paymentError } = await supabase.from("Payment").insert({
      orderId: order.orderId,
      molliePaymentId: payment.id,
      status: payment.status,
      amount: Number(order.total),
    });
    if (paymentError) throw new Error(paymentError.message);

    const checkoutUrl = payment.getCheckoutUrl();
    if (!checkoutUrl) throw new Error("Mollie returned no checkout URL");

    return {
      ok: true,
      checkoutUrl,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      accessToken: order.accessToken,
    };
  } catch (err) {
    console.error("[checkout] Mollie payment failed:", err);

    // Free the reserved works again
    await supabase.rpc("release_order", { p_order_id: order.orderId, p_new_status: "cancelled" });

    return {
      ok: false,
      message: "De betaling kon niet gestart worden. Probeer het over een paar minuten opnieuw.",
    };
  }
}
