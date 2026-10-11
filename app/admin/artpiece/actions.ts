"use server";

import { v4 as uuidv4 } from "uuid";
import { isAdmin } from "@/lib/auth/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SOLD_COLLECTION_ID } from "@/lib/services/art-piece-service";
import type { SizeClass } from "@/lib/types";

const ARTPIECE_TABLE = "ArtPiece";

export interface SaveArtPieceInput {
  title: string;
  artist: string;
  dimensions: string;
  price: number;
  description: string;
  frame: string;
  structure: string;
  presentation: string;
  edition: string;
  finish: string;
  shippingInfo: string;
  sizeClass: SizeClass;

  imageUrls: string[];
  labelIds: string[];
  newLabel: string;

  collectionId: string | null;
  newCollectionTitle: string;
  newCollectionDescription: string;
}

async function assertAdmin() {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");
}

// Creates the art piece when id is null, otherwise updates it.
export async function saveArtPiece(id: string | null, input: SaveArtPieceInput): Promise<void> {
  await assertAdmin();

  const supabase = createAdminClient();

  const labelIds = [...input.labelIds];
  if (input.newLabel.trim()) {
    const labelId = uuidv4();
    const { error } = await supabase.from("Label").insert({ id: labelId, title: input.newLabel });
    if (error) throw new Error(error.message);
    labelIds.push(labelId);
  }

  let collectionId = input.collectionId;
  if (!collectionId && input.newCollectionTitle.trim()) {
    collectionId = uuidv4();
    const { error } = await supabase.from("Collection").insert({
      id: collectionId,
      title: input.newCollectionTitle,
      description: input.newCollectionDescription,
    });
    if (error) throw new Error(error.message);
  }

  const params = {
    p_title: input.title,
    p_artist: input.artist,
    p_dimensions: input.dimensions,
    p_price: input.price,
    p_description: input.description,
    p_frame: input.frame,
    p_structure: input.structure,
    p_presentation: input.presentation,
    p_edition: input.edition,
    p_finish: input.finish,
    // Legacy RPC parameter; removed when the RPCs are rewritten
    p_etsy_url: null,
    p_shipping_info: input.shippingInfo,

    p_images: input.imageUrls,
    p_label_ids: labelIds,

    p_collection_id: collectionId,

    p_collection_title: null,
    p_collection_description: null,
    p_collection_thumbnail_url: null,
    p_is_featured: false,
  };

  const { data, error } = id
    ? await supabase.rpc("update_art_piece", { p_id: id, ...params })
    : await supabase.rpc("create_art_piece", params);

  if (error) throw new Error(error.message);

  // The RPCs don't know sizeClass yet, so it is set in a separate update.
  // TODO: move into the RPCs once they are rewritten.
  const pieceId = id ?? (await resolveCreatedPieceId(data, input.title));
  if (!pieceId) throw new Error("Kunstwerk opgeslagen, maar formaat (klein/groot) niet: pas het werk aan om het formaat in te stellen.");

  const { error: sizeError } = await supabase
    .from(ARTPIECE_TABLE)
    .update({ sizeClass: input.sizeClass === "large" ? "large" : "small" })
    .eq("id", pieceId);
  if (sizeError) throw new Error(sizeError.message);
}

// create_art_piece's return value is not under our control; accept an id,
// a row, or fall back to the newest piece with this title.
async function resolveCreatedPieceId(rpcResult: unknown, title: string): Promise<string | null> {
  if (typeof rpcResult === "string") return rpcResult;

  const row = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
  if (row && typeof row === "object" && typeof (row as { id?: unknown }).id === "string") {
    return (row as { id: string }).id;
  }

  const { data } = await createAdminClient()
    .from(ARTPIECE_TABLE)
    .select("id")
    .eq("title", title)
    .order("creationTime", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

export async function toggleArtPieceFeatured(pieceId: string): Promise<void> {
  await assertAdmin();

  const supabase = createAdminClient();
  const { data, error: fetchError } = await supabase
    .from(ARTPIECE_TABLE)
    .select("isFeatured")
    .eq("id", pieceId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from(ARTPIECE_TABLE)
    .update({ isFeatured: !data.isFeatured })
    .eq("id", pieceId);
  if (error) throw new Error(error.message);
}

export async function toggleArtPieceSold(pieceId: string): Promise<void> {
  await assertAdmin();

  const supabase = createAdminClient();
  const { data, error: fetchError } = await supabase
    .from(ARTPIECE_TABLE)
    .select("isSold")
    .eq("id", pieceId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const willBeSold = !data.isSold;

  const { error } = await supabase
    .from(ARTPIECE_TABLE)
    .update(
      willBeSold
        ? { isSold: true, collectionId: SOLD_COLLECTION_ID }
        : { isSold: false }
    )
    .eq("id", pieceId);
  if (error) throw new Error(error.message);
}

// Returns an error message, or undefined on success
export async function deleteArtPiece(pieceId: string): Promise<string | undefined> {
  await assertAdmin();

  const supabase = createAdminClient();
  const { error } = await supabase.from(ARTPIECE_TABLE).delete().eq("id", pieceId);

  return error?.message;
}
