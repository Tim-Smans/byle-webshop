"use server";

import {
  lookupWithdrawableOrder,
  registerWithdrawal,
  type WithdrawableItem,
} from "@/lib/withdrawals/withdrawal-service";
import { sendWithdrawalEmails } from "@/lib/email/withdrawal-emails";

export interface WithdrawalFormInput {
  name: string;
  email: string;
  orderNumber: string;
  token: string;
  // Honeypot
  website: string;
}

export type LookupResult =
  | { ok: true; orderNumber: string; lastDayLabel: string | null; items: WithdrawableItem[] }
  // canCancel: not shipped yet, so the customer can cancel instead
  | { ok: false; message: string; canCancel?: { orderNumber: string } };

export type SubmitResult =
  | { ok: true; orderNumber: string; submittedAtLabel: string; itemTitles: string[]; emailSent: boolean }
  | { ok: false; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value: unknown, max = 200) => (typeof value === "string" ? value.trim().slice(0, max) : "");

function normalize(raw: Record<string, unknown>): WithdrawalFormInput {
  return {
    name: clean(raw.name, 150),
    email: clean(raw.email).toLowerCase(),
    orderNumber: clean(raw.orderNumber, 40).toUpperCase(),
    token: clean(raw.token, 100),
    website: clean(raw.website),
  };
}

function validate(input: WithdrawalFormInput): string | null {
  if (input.website) return "Er ging iets mis. Probeer het opnieuw.";
  if (!input.name) return "Vul je naam in.";
  if (!EMAIL_PATTERN.test(input.email)) return "Vul een geldig e-mailadres in.";
  if (!input.orderNumber) return "Vul je bestelnummer in.";
  return null;
}

const CONTACT = "Neem gerust contact op via byle.art@outlook.com, dan bekijken we het samen.";

async function lookup(input: WithdrawalFormInput): Promise<LookupResult> {
  const result = await lookupWithdrawableOrder({
    orderNumber: input.orderNumber,
    email: input.email,
    token: input.token || undefined,
  });

  if (result.ok) {
    return { ok: true, orderNumber: result.orderNumber, lastDayLabel: result.lastDayLabel, items: result.items };
  }

  const messages: Record<typeof result.reason, string> = {
    not_found: "We vinden geen bestelling met dit bestelnummer en e-mailadres. Kijk ze even na: je vindt ze in je bevestigingsmail.",
    not_paid: "Deze bestelling werd niet betaald, dus er is niets te herroepen.",
    not_shipped:
      "Je bestelling is nog niet verzonden of afgehaald. Herroepen is dus niet nodig: je kan ze kosteloos annuleren en krijgt het volledige bedrag meteen terug.",
    expired: `De herroepingstermijn voor deze bestelling liep af${result.lastDayLabel ? ` op ${result.lastDayLabel}` : ""}. ${CONTACT}`,
    nothing_left: "Alle werken van deze bestelling werden al herroepen. Je kreeg daarvan een bevestiging per e-mail.",
    custom_work: `Deze bestelling betreft maatwerk dat volgens jouw persoonlijke wensen werd gemaakt. Daarvoor geldt het wettelijke herroepingsrecht niet. ${CONTACT}`,
  };
  return {
    ok: false,
    message: messages[result.reason],
    ...(result.reason === "not_shipped" && result.orderNumber ? { canCancel: { orderNumber: result.orderNumber } } : {}),
  };
}

export async function lookupOrderForWithdrawal(raw: Record<string, unknown>): Promise<LookupResult> {
  const input = normalize(raw);
  const error = validate(input);
  if (error) return { ok: false, message: error };

  return lookup(input);
}

export async function submitWithdrawal(raw: Record<string, unknown>): Promise<SubmitResult> {
  const input = normalize(raw);
  const error = validate(input);
  if (error) return { ok: false, message: error };

  const reason = clean(raw.reason, 1000);
  const selectedIds = Array.isArray(raw.orderItemIds)
    ? raw.orderItemIds.filter((id): id is string => typeof id === "string")
    : [];

  // Everything is checked again: never trust what the browser still shows
  const result = await lookupWithdrawableOrder({
    orderNumber: input.orderNumber,
    email: input.email,
    token: input.token || undefined,
  });
  if (!result.ok) {
    const again = await lookup(input);
    return { ok: false, message: again.ok ? "Probeer het opnieuw." : again.message };
  }

  const items = result.items.filter((item) => selectedIds.includes(item.id));
  if (items.length === 0) return { ok: false, message: "Kies minstens één kunstwerk dat je wilt herroepen." };

  let withdrawal: { id: string; submittedAt: string };
  try {
    withdrawal = await registerWithdrawal({
      orderId: result.orderId,
      name: input.name,
      email: input.email,
      orderNumberInput: input.orderNumber,
      reason,
      orderItemIds: items.map((item) => item.id),
    });
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Er ging iets mis." };
  }

  // The withdrawal is valid once registered; a mail problem doesn't undo it
  let emailSent = true;
  try {
    await sendWithdrawalEmails(withdrawal.id);
  } catch (err) {
    console.error("[withdrawal] confirmation e-mail failed:", err);
    emailSent = false;
  }

  return {
    ok: true,
    orderNumber: result.orderNumber,
    submittedAtLabel: new Intl.DateTimeFormat("nl-BE", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Brussels",
    }).format(new Date(withdrawal.submittedAt)),
    itemTitles: items.map((item) => item.title),
    emailSent,
  };
}
