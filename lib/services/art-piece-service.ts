import { ArtPiece } from "../types";
import { supabase } from "../supabase/client"
import { PostgrestError } from "@supabase/supabase-js";
import { normalizeLabel } from "../utils";

const ARTPIECE_TABLE = 'ArtPiece'
const IMAGE_TABLE = 'Image'
const LABEL_TABLE = 'Label'
const PIECELABEL_TABLE = 'PieceLabel'

export const getArtPieces = async (): Promise<ArtPiece[] | undefined> => {
  const { data: pieces } = await supabase
    .from(ARTPIECE_TABLE)
    .select(
      `
            *,
            ${IMAGE_TABLE} (*),
            ${PIECELABEL_TABLE} (
                ${LABEL_TABLE} (*)
            )
            `
    );

    console.log('dit zijn pieces: ', pieces)
  if (!pieces) {
    return undefined
  }

  return pieces?.map(mapArtPiece)
}
export const getArtPieceById = async (artPieceId: string): Promise<ArtPiece | undefined> => {
  const { data: piece } = await supabase
    .from(ARTPIECE_TABLE)
    .select(
      `
            *,
            ${IMAGE_TABLE} (*),
            ${PIECELABEL_TABLE} (
                ${LABEL_TABLE} (*)
            )
            `
    )
    .eq("id", artPieceId)
    .single()

  console.log(piece)

  if (!piece) {
    return undefined
  }

  return mapArtPiece(piece)
}

export const createArtPiece = async (
  input: CreateArtPieceInput
) => {
  const { data, error } = await supabase.rpc(
    "create_art_piece",
    {
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
      p_is_featured: input.isFeatured,
      p_etsy_url: input.etsyUrl,

      p_images: input.images,
      p_label_ids: input.labelIds,

      p_collection_id: input.collection?.id ?? null,
      p_collection_title: input.collection?.title ?? null,
      p_collection_thumbnail_url:
        input.collection?.thumbnailUrl ?? null,
      p_collection_description:
        input.collection?.description ?? null,
    }
  );

  if (error) throw error;

  return data;
}

export const updateArtPiece = async (
  id: string,
  input: CreateArtPieceInput
) => {
  const { data, error } = await supabase.rpc(
    "update_art_piece",
    {
      p_id: id,

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
      p_is_featured: input.isFeatured,
      p_etsy_url: input.etsyUrl,

      p_images: input.images,
      p_label_ids: input.labelIds,

      p_collection_id: input.collection?.id ?? null,
      p_collection_title: input.collection?.title ?? null,
      p_collection_thumbnail_url:
        input.collection?.thumbnailUrl ?? null,
      p_collection_description:
        input.collection?.description ?? null,
    }
  );

  if (error) throw error;

  return data;
};

export const toggleArtPieceFeatured = async (pieceId: string) => {
  const { data, error: fetchError } = await supabase
    .from(ARTPIECE_TABLE)
    .select('isFeatured')
    .eq('id', pieceId)
    .single()

  if (fetchError) {
    throw fetchError
  }

  const { error } = await supabase
    .from(ARTPIECE_TABLE)
    .update({ isFeatured: !data.isFeatured })
    .eq('id', pieceId)

  if (error) {
    throw error
  }
}

export const isArtPieceFeatured = async (pieceId: string) => {
  const { data, error: fetchError } = await supabase
    .from(ARTPIECE_TABLE)
    .select('isFeatured')
    .eq('id', pieceId)
    .single()

  if (fetchError) {
    throw fetchError
  }

  return data.isFeatured
}

export const toggleArtPieceSold = async (pieceId: string) => {
  const { data, error: fetchError } = await supabase
    .from(ARTPIECE_TABLE)
    .select('isSold')
    .eq('id', pieceId)
    .single()

  if (fetchError) {
    throw fetchError
  }

  const { error } = await supabase
    .from(ARTPIECE_TABLE)
    .update({ isSold: !data.isSold })
    .eq('id', pieceId)

  if (error) {
    throw error
  }
}

export const isArtPieceSold = async (pieceId: string) => {
  const { data, error: fetchError } = await supabase
    .from(ARTPIECE_TABLE)
    .select('isSold')
    .eq('id', pieceId)
    .single()

  if (fetchError) {
    throw fetchError
  }

  return data.isSold
}

export const deleteArtPiece = async (pieceId: string): Promise<PostgrestError | undefined> => {
  const { error } = await supabase
    .from(ARTPIECE_TABLE)
    .delete()
    .eq('id', pieceId)

  if (error) {
    return error
  }
}

const mapArtPiece = (
  dbPiece: any
): ArtPiece => {

  return {
    id: dbPiece.id,
    title: dbPiece.title,
    artist: dbPiece.artist,
    dimensions: dbPiece.dimensions,
    price: dbPiece.price,
    description: dbPiece.description,
    isFeatured: dbPiece.isFeatured,
    frame: dbPiece.frame,
    structure: dbPiece.structure,
    presentation: dbPiece.presentation,
    edition: dbPiece.edition,
    finish: dbPiece.finish,
    etsyUrl: dbPiece.etsyUrl ?? null,
    isSold: dbPiece.isSold,
    creationTime: dbPiece.creationTime,
    collectionId: dbPiece.collectionId,
    shippingInfo: dbPiece.shippingInfo ?? "",

    images: dbPiece.Image.map(
      (img: any) => ({
        id: img.id,
        pieceId: dbPiece.id,
        url: img.url,
        index: img.index
      })
    ),

    labels: dbPiece.PieceLabel.map(
      (pl: any) => ({
        id: pl.Label.id,
        title: normalizeLabel(pl.Label.title)
      })
    )
  };
}

export interface CreateArtPieceInput {
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
  isFeatured?: boolean;
  etsyUrl?: string;

  images: string[];          // urls
  labelIds: string[];        // bestaande labels

  collection?: {
    id?: string;             // bestaande collection
    title?: string;          // nieuwe collection
    thumbnailUrl?: string;
    description?: string;
  };
}