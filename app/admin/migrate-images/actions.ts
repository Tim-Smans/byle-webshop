"use server";

import { isAdmin } from "@/lib/auth/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateImageUrl(imageId: string, newUrl: string): Promise<void> {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("Image")
    .update({ url: newUrl })
    .eq("id", imageId);

  if (error) throw new Error(error.message);
}

export async function deleteStorageFiles(paths: string[]): Promise<void> {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  if (paths.length === 0) return;

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from("images").remove(paths);
  if (error) throw new Error(error.message);
}
