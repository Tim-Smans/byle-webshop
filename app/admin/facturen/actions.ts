"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth/admin-auth";
import { createMissingInvoices } from "@/lib/invoicing/invoice-service";

export async function createMissingInvoicesAction(): Promise<{ created: number }> {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  const created = await createMissingInvoices();
  revalidatePath("/admin/facturen");
  return { created };
}
