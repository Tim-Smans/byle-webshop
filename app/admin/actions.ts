"use server";

import { isAdmin } from "@/lib/auth/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SOLD_COLLECTION_ID } from "@/lib/services/art-piece-service";

export async function moveSoldArtPiecesToSoldCollection(): Promise<{ movedCount: number }> {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("ArtPiece")
    .update({ collectionId: SOLD_COLLECTION_ID })
    .eq("isSold", true)
    .select("id");

  if (error) throw new Error(error.message);

  return { movedCount: data?.length ?? 0 };
}

export async function deleteNewsletterSubscriber(id: string): Promise<void> {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("NewsletterSubscriber")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
