import { ArtPiece, Collection } from "../types";
import { supabase } from "../supabase/client"

const COLLECTIONS_TABLE = 'Collection'

export const getCollections = async (): Promise<Collection[] | undefined> => {
    const { data: collections } = await supabase
        .from(COLLECTIONS_TABLE)
        .select();

    if (!collections) {
        return undefined
    }

    return collections?.map(mapCollection)
}

const mapCollection = (
  dbCollection: any
): Collection => {

  return {
    id: dbCollection.id,
    title: dbCollection.title,
    thumbnailUrl: dbCollection.thumbnailUrl,
    description: dbCollection.description
  };
}