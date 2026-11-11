"use server";

import { isAdmin } from "@/lib/auth/admin-auth";
import {
  cancelTerminalPayment,
  createTerminalPayment,
  getTerminalPayment,
  type TerminalPayment,
} from "@/lib/mollie/terminal";

const MAX_AMOUNT = 10000;
const DEFAULT_DESCRIPTION = "Marktverkoop Art by Le";

// Errors are returned instead of thrown: Next.js hides thrown messages in
// production, and at the market the admin needs to see what went wrong
export type TerminalResult = { payment: TerminalPayment } | { error: string };

async function run(label: string, fn: () => Promise<TerminalPayment>): Promise<TerminalResult> {
  if (!(await isAdmin())) return { error: "Je bent niet meer ingelogd. Log opnieuw in." };
  try {
    return { payment: await fn() };
  } catch (err) {
    console.error(`[markt] ${label} failed:`, err);
    return { error: err instanceof Error ? err.message : "Onbekende fout" };
  }
}

function assertPaymentId(paymentId: string) {
  if (!/^tr_\w+$/.test(paymentId)) throw new Error("Ongeldige betaling");
}

// "12,5" or "12.50" -> "12.50", the format Mollie expects
function parseAmount(input: string): string {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Vul een geldig bedrag in, bijvoorbeeld 25 of 12,50");
  }
  const amount = Number(normalized);
  if (amount <= 0) throw new Error("Het bedrag moet groter zijn dan 0");
  if (amount > MAX_AMOUNT) throw new Error(`Het bedrag mag niet hoger zijn dan € ${MAX_AMOUNT}`);
  return amount.toFixed(2);
}

export async function sendToTerminalAction(
  amount: string,
  description: string,
  idempotencyKey: string,
): Promise<TerminalResult> {
  return run("send", async () => {
    const value = parseAmount(amount);
    const text = description.trim().slice(0, 255) || DEFAULT_DESCRIPTION;
    if (!/^[\w-]{8,64}$/.test(idempotencyKey)) throw new Error("Ongeldige aanvraag");
    return createTerminalPayment(value, text, idempotencyKey);
  });
}

export async function getTerminalPaymentAction(paymentId: string): Promise<TerminalResult> {
  return run("status", async () => {
    assertPaymentId(paymentId);
    return getTerminalPayment(paymentId);
  });
}

export async function cancelTerminalPaymentAction(paymentId: string): Promise<TerminalResult> {
  return run("cancel", async () => {
    assertPaymentId(paymentId);
    return cancelTerminalPayment(paymentId);
  });
}
