"use server";

import { isAdmin } from "@/lib/auth/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const IMAGES_BUCKET = "images";

// Flat file names only (no folders), e.g. "{uuid}.webp" or "{uuid}-t.webp"
const ALLOWED_PATH = /^[A-Za-z0-9_-]+\.webp$/;

export interface SignedImageUpload {
  path: string;
  token: string;
  publicUrl: string;
}

// Images are uploaded straight from the browser (server actions have a ~1 MB
// body limit), using one-time signed URLs that work regardless of storage RLS.
export async function createImageUploadUrls(
  paths: string[],
  upsert = false
): Promise<SignedImageUpload[]> {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  if (paths.some((path) => !ALLOWED_PATH.test(path))) {
    throw new Error("Invalid image path");
  }

  const supabase = createAdminClient();

  return Promise.all(
    paths.map(async (path) => {
      const { data, error } = await supabase.storage
        .from(IMAGES_BUCKET)
        .createSignedUploadUrl(path, { upsert });
      if (error) throw new Error(error.message);

      const { data: urlData } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);

      return { path, token: data.token, publicUrl: urlData.publicUrl };
    })
  );
}

export async function listImageFiles(): Promise<string[]> {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(IMAGES_BUCKET).list("", { limit: 1000 });
  if (error) throw new Error(error.message);

  return (data ?? []).map((file) => file.name);
}
