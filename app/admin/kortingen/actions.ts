"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { ANNOUNCEMENTS_TAG } from "@/lib/announcements/banner";
import { isAdmin } from "@/lib/auth/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DISCOUNT_CODE_PATTERN, normalizeDiscountCode, type DiscountType } from "@/lib/shop/discount";

const DISCOUNT_CODE_TABLE = "DiscountCode";

export interface DiscountCodeInput {
  code: string;
  description: string;
  type: DiscountType;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  // YYYY-MM-DD, Belgian calendar days, both inclusive
  validFrom: string | null;
  validUntil: string | null;
  excludeSaleItems: boolean;
  isActive: boolean;
}

async function assertAdmin() {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validate(input: DiscountCodeInput) {
  const code = normalizeDiscountCode(input.code);
  if (!DISCOUNT_CODE_PATTERN.test(code)) {
    throw new Error("Een code heeft 3 tot 40 tekens: letters, cijfers, - of _ (geen spaties).");
  }

  const type: DiscountType = input.type === "amount" ? "amount" : "percent";
  const value = Math.round(Number(input.value) * 100) / 100;
  if (!Number.isFinite(value) || value <= 0) throw new Error("Vul een korting groter dan 0 in.");
  if (type === "percent" && (!Number.isInteger(value) || value > 99)) {
    throw new Error("Een percentage is een heel getal tussen 1 en 99.");
  }
  if (type === "amount" && value > 100000) throw new Error("Dat bedrag is te hoog.");

  const minOrderAmount =
    input.minOrderAmount === null ? null : Math.round(Number(input.minOrderAmount) * 100) / 100;
  if (minOrderAmount !== null && (!Number.isFinite(minOrderAmount) || minOrderAmount <= 0)) {
    throw new Error("Het minimumbedrag moet groter dan 0 zijn, of leeg.");
  }

  const maxUses = input.maxUses === null ? null : Number(input.maxUses);
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
    throw new Error("Het maximum aantal keer is een heel getal vanaf 1, of leeg.");
  }

  const validFrom = input.validFrom || null;
  const validUntil = input.validUntil || null;
  if ((validFrom && !DATE_PATTERN.test(validFrom)) || (validUntil && !DATE_PATTERN.test(validUntil))) {
    throw new Error("Ongeldige datum.");
  }
  if (validFrom && validUntil && validFrom > validUntil) {
    throw new Error("De einddatum ligt vóór de begindatum.");
  }

  return {
    code,
    description: input.description.trim().slice(0, 300) || null,
    type,
    value,
    minOrderAmount,
    maxUses,
    validFrom,
    validUntil,
    excludeSaleItems: Boolean(input.excludeSaleItems),
    isActive: Boolean(input.isActive),
  };
}

// Creates the code when id is null, otherwise updates it
export async function saveDiscountCode(id: string | null, input: DiscountCodeInput): Promise<void> {
  await assertAdmin();

  const row = validate(input);
  const supabase = createAdminClient();

  const { error } = id
    ? await supabase.from(DISCOUNT_CODE_TABLE).update(row).eq("id", id)
    : await supabase.from(DISCOUNT_CODE_TABLE).insert(row);

  if (error) {
    throw new Error(error.code === "23505" ? `De code ${row.code} bestaat al.` : error.message);
  }

  revalidatePath("/admin/kortingen");
  // The banner hides messages whose code can no longer be used
  revalidateTag(ANNOUNCEMENTS_TAG, { expire: 0 });
}

export async function setDiscountCodeActive(id: string, isActive: boolean): Promise<void> {
  await assertAdmin();

  const { error } = await createAdminClient()
    .from(DISCOUNT_CODE_TABLE)
    .update({ isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/kortingen");
  // The banner hides messages whose code can no longer be used
  revalidateTag(ANNOUNCEMENTS_TAG, { expire: 0 });
}

// Only codes that were never used: a used code stays as history; switch it
// off instead
export async function deleteDiscountCode(id: string): Promise<void> {
  await assertAdmin();

  const supabase = createAdminClient();
  const { count, error: countError } = await supabase
    .from("Order")
    .select("id", { count: "exact", head: true })
    .eq("discountCodeId", id);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) {
    throw new Error("Deze code werd al gebruikt in een bestelling. Zet ze uit in plaats van ze te verwijderen.");
  }

  const { error } = await supabase.from(DISCOUNT_CODE_TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/kortingen");
  // The banner hides messages whose code can no longer be used
  revalidateTag(ANNOUNCEMENTS_TAG, { expire: 0 });
}
