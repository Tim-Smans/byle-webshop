import { ArtPiece } from "../types";
import { supabase } from "../supabase/client"

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

    images: dbPiece.Image.map(
      (img: any) => ({
        id: img.id,
        pieceId: dbPiece.id,
        url: img.url
      })
    ),

    labels: dbPiece.PieceLabel.map(
      (pl: any) => ({
        id: pl.Label.id,
        title: pl.Label.title
      })
    )
  };
}