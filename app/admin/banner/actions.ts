"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/auth/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ANNOUNCEMENTS_TAG } from "@/lib/announcements/banner";
import { normalizeBannerTheme, type BannerTheme } from "@/lib/announcements/types";
import { brusselsLocalToIso } from "@/lib/shop/brussels-time";

const ANNOUNCEMENT_TABLE = "Announcement";

export interface AnnouncementInput {
  message: string;
  linkUrl: string;
  linkLabel: string;
  discountCodeId: string | null;
  theme: BannerTheme;
  showCountdown: boolean;
  // "2026-11-20T23:59" in Belgian time, or empty
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

async function assertAdmin() {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");
}

// The banner is on every page: show the change right away
function refreshBanner() {
  revalidateTag(ANNOUNCEMENTS_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

function validate(input: AnnouncementInput) {
  const message = input.message.trim().replace(/\s+/g, " ");
  if (!message) throw new Error("Vul een tekst in.");
  if (message.length > 200) throw new Error("De tekst mag maximaal 200 tekens lang zijn.");

  const linkUrl = input.linkUrl.trim() || null;
  if (linkUrl && !/^(\/|https:\/\/)/.test(linkUrl)) {
    throw new Error("Een link begint met / (een pagina van de webshop) of met https://.");
  }

  const startsAt = input.startsAt ? brusselsLocalToIso(input.startsAt) : null;
  const endsAt = input.endsAt ? brusselsLocalToIso(input.endsAt) : null;
  if ((input.startsAt && !startsAt) || (input.endsAt && !endsAt)) throw new Error("Ongeldige datum.");
  if (startsAt && endsAt && startsAt >= endsAt) throw new Error("Het einde ligt vóór het begin.");

  return {
    message,
    linkUrl,
    linkLabel: linkUrl ? input.linkLabel.trim().slice(0, 40) || null : null,
    discountCodeId: input.discountCodeId || null,
    theme: normalizeBannerTheme(input.theme),
    showCountdown: Boolean(input.showCountdown),
    startsAt,
    endsAt,
    isActive: Boolean(input.isActive),
  };
}

export async function setBannerEnabled(enabled: boolean): Promise<void> {
  await assertAdmin();

  const { error } = await createAdminClient()
    .from("SiteSetting")
    .upsert({ key: "announcementBar", value: { enabled } }, { onConflict: "key" });
  if (error) throw new Error(error.message);

  refreshBanner();
  revalidatePath("/admin/banner");
}

// Creates the message when id is null, otherwise updates it
export async function saveAnnouncement(id: string | null, input: AnnouncementInput): Promise<void> {
  await assertAdmin();

  const row = validate(input);
  const supabase = createAdminClient();

  if (id) {
    const { error } = await supabase.from(ANNOUNCEMENT_TABLE).update(row).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    // New messages go last
    const { data: last } = await supabase
      .from(ANNOUNCEMENT_TABLE)
      .select("sortOrder")
      .order("sortOrder", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await supabase
      .from(ANNOUNCEMENT_TABLE)
      .insert({ ...row, sortOrder: (last?.sortOrder ?? -1) + 1 });
    if (error) throw new Error(error.message);
  }

  refreshBanner();
  revalidatePath("/admin/banner");
}

export async function setAnnouncementActive(id: string, isActive: boolean): Promise<void> {
  await assertAdmin();

  const { error } = await createAdminClient().from(ANNOUNCEMENT_TABLE).update({ isActive }).eq("id", id);
  if (error) throw new Error(error.message);

  refreshBanner();
  revalidatePath("/admin/banner");
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await assertAdmin();

  const { error } = await createAdminClient().from(ANNOUNCEMENT_TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);

  refreshBanner();
  revalidatePath("/admin/banner");
}

// Moves a message one place up (-1) or down (1) in the rotation
export async function moveAnnouncement(id: string, direction: -1 | 1): Promise<void> {
  await assertAdmin();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(ANNOUNCEMENT_TABLE)
    .select("id")
    .order("sortOrder", { ascending: true })
    .order("createdAt", { ascending: true });
  if (error) throw new Error(error.message);

  const ids = (data ?? []).map((row) => row.id as string);
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];

  const results = await Promise.all(
    ids.map((rowId, sortOrder) => supabase.from(ANNOUNCEMENT_TABLE).update({ sortOrder }).eq("id", rowId))
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);

  refreshBanner();
  revalidatePath("/admin/banner");
}
