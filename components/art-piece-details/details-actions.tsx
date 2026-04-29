import { ArtPiece } from "@/lib/types"
import { FC, useState } from "react"
import { Button } from "../ui/button"
import { useFavorites } from "@/lib/context/favorites-context"
import { Check, Share2, Star } from "lucide-react"

interface Props {
    artPiece: ArtPiece
}

const DetailsActions: FC<Props> = ({ artPiece }) => {
    const [isAdded, setIsAdded] = useState<boolean>(false)
    const { addItem } = useFavorites()

    const handleAddToCart = async () => {
        await addItem({ ...artPiece })
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
    }

    return (
        <div className="flex gap-3 mb-8">
            {artPiece.isSold ? (
                <Button
                    size="lg"
                    className="flex-1 py-6 text-base font-sans tracking-wide"
                    disabled
                >
                    Sold Out
                </Button>
            ) : (
                <Button
                    size="lg"
                    className="flex-1 py-6 text-base font-sans tracking-wide"
                    onClick={handleAddToCart}
                    disabled={isAdded}
                >
                    {isAdded ? (
                        <>
                            <Check className="h-5 w-5 mr-2" />
                            Added to Favorites
                        </>
                    ) : (
                        <>
                            <Star className="h-5 w-5 mr-2" />
                            Add to Favorites
                        </>
                    )}
                </Button>
            )}
            <Button
                size="lg"
                variant="outline"
                className="px-4"
            >
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share</span>
            </Button>
        </div>
    )
}

export default DetailsActions