"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const NEWSLETTER_TABLE = "NewsletterSubscriber";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeToNewsletter(
  rawEmail: string
): Promise<{ success: boolean; error?: string }> {
  const email = rawEmail.trim().toLowerCase();

  if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
    return { success: false, error: "Vul een geldig e-mailadres in." };
  }

  const supabase = createAdminClient();

  // Already subscribed emails are ignored, so the visitor still gets a success message
  const { error } = await supabase
    .from(NEWSLETTER_TABLE)
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    console.error("Newsletter subscribe failed:", error.message);
    return { success: false, error: "Er ging iets mis, probeer het later opnieuw." };
  }

  return { success: true };
}
