import "server-only";
import { PaymentMethod, type Payment } from "@mollie/api-client";
import { getMollieClient } from "./client";

// Market sales: payments pushed to the Mollie terminal / Tap to Pay app.
// They are not linked to an order, so the webhook and payment sync ignore them.

export function getTerminalId(): string {
  const terminalId = process.env.MOLLIE_TERMINAL_ID;
  if (!terminalId) {
    throw new Error("MOLLIE_TERMINAL_ID is not set");
  }
  return terminalId;
}

export type TerminalInfo = {
  id: string;
  description: string;
  status: string;
  mode: "live" | "test";
  brand: string | null;
  model: string | null;
};

export async function getTerminalInfo(): Promise<TerminalInfo> {
  const terminal = await getMollieClient().terminals.get(getTerminalId());
  return {
    id: terminal.id,
    description: terminal.description,
    status: terminal.status,
    mode: terminal.mode,
    brand: terminal.brand ?? null,
    model: terminal.model ?? null,
  };
}

export type TerminalPayment = {
  id: string;
  status: string;
  amount: number;
  description: string;
  isCancelable: boolean;
  cardLabel: string | null;
  cardNumber: string | null;
};

function toTerminalPayment(payment: Payment): TerminalPayment {
  const details = (payment.details ?? {}) as { cardLabel?: string | null; cardNumber?: string | null };
  return {
    id: payment.id,
    status: payment.status,
    amount: Number(payment.amount.value),
    description: payment.description,
    isCancelable: payment.isCancelable ?? false,
    cardLabel: details.cardLabel ?? null,
    cardNumber: details.cardNumber ?? null,
  };
}

// The idempotency key makes a retried request return the same payment
// instead of asking the customer to pay twice
export async function createTerminalPayment(
  amount: string,
  description: string,
  idempotencyKey: string,
): Promise<TerminalPayment> {
  const payment = await getMollieClient().payments.create({
    amount: { currency: "EUR", value: amount },
    description,
    method: PaymentMethod.pointofsale,
    terminalId: getTerminalId(),
    metadata: { source: "markt" },
    idempotencyKey,
  });
  return toTerminalPayment(payment);
}

// Only returns payments made on our terminal, so these helpers cannot be
// used to look at or cancel webshop payments
async function getOwnTerminalPayment(paymentId: string): Promise<Payment> {
  const payment = await getMollieClient().payments.get(paymentId);
  const terminalId = (payment.details as { terminalId?: string } | null)?.terminalId;
  if (payment.method !== PaymentMethod.pointofsale || terminalId !== getTerminalId()) {
    throw new Error("Deze betaling hoort niet bij de terminal");
  }
  return payment;
}

export async function getTerminalPayment(paymentId: string): Promise<TerminalPayment> {
  return toTerminalPayment(await getOwnTerminalPayment(paymentId));
}

export async function cancelTerminalPayment(paymentId: string): Promise<TerminalPayment> {
  const payment = await getOwnTerminalPayment(paymentId);
  if (!payment.isCancelable) {
    return toTerminalPayment(payment);
  }
  return toTerminalPayment(await getMollieClient().payments.cancel(paymentId));
}
