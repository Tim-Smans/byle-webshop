import { ArtPiece } from "../types";
import { supabase } from "../supabase/client"
import { normalizeLabel } from "../utils";

// Read-only queries with the public key. Mutations live in
// app/admin/artpiece/actions.ts and run server-side with the service role.

const ARTPIECE_TABLE = 'ArtPiece'
const IMAGE_TABLE = 'Image'
const LABEL_TABLE = 'Label'
const PIECELABEL_TABLE = 'PieceLabel'

export const SOLD_COLLECTION_ID = 'a413fc29-b2d2-464c-8c37-31f109ec047d'

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
    isSold: dbPiece.isSold,
    status: dbPiece.status ?? (dbPiece.isSold ? "sold" : "available"),
    sizeClass: dbPiece.sizeClass ?? "small",
    reservedUntil: dbPiece.reservedUntil ?? null,
    reservedByOrderId: dbPiece.reservedByOrderId ?? null,
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
