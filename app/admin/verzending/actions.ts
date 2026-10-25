"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCountryName } from "@/lib/shop/countries";

const SHIPPING_RATE_TABLE = "ShippingRate";

export interface ShippingRateInput {
  countryCode: string;
  priceSmall: number;
  priceLarge: number;
  isActive: boolean;
}

async function assertAdmin() {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");
}

function validatePrice(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0 || value > 10000) {
    throw new Error(`Ongeldige prijs voor ${label}`);
  }
  return Math.round(value * 100) / 100;
}

// Adds the country, or updates it when it already has a rate
export async function saveShippingRate(input: ShippingRateInput): Promise<void> {
  await assertAdmin();

  const countryName = getCountryName(input.countryCode);
  if (!countryName) throw new Error("Onbekend land");

  const supabase = createAdminClient();
  const { error } = await supabase.from(SHIPPING_RATE_TABLE).upsert(
    {
      countryCode: input.countryCode,
      countryName,
      priceSmall: validatePrice(input.priceSmall, "klein"),
      priceLarge: validatePrice(input.priceLarge, "groot"),
      isActive: input.isActive,
    },
    { onConflict: "countryCode" }
  );
  if (error) throw new Error(error.message);

  revalidatePath("/admin/verzending");
}

export async function deleteShippingRate(id: string): Promise<void> {
  await assertAdmin();

  const supabase = createAdminClient();
  const { error } = await supabase.from(SHIPPING_RATE_TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/verzending");
}
