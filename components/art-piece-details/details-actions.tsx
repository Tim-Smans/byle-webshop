import { ArtPiece } from "@/lib/types"
import { FC, useState } from "react"
import { Button } from "../ui/button"
import { useFavorites } from "@/lib/context/favorites-context"
import { Check, Share2, Star } from "lucide-react"
import { FaEtsy } from "react-icons/fa"
import Link from "next/link"

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

    const etsyUrl = process.env.NEXT_PUBLIC_ETSY_STORE_URL

    if (etsyUrl === undefined) {
        throw new Error("NEXT_PUBLIC_ETSY_STORE_URL env variable not filled out")
    }

    return (
        <div className="flex gap-3 mb-8">
            {artPiece.isSold ? (
                <Button
                    size="lg"
                    className="flex-1 py-6 text-base font-sans tracking-wide"
                    disabled
                >
                    Niet meer beschikbaar
                </Button>
            ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        size="lg"
                        className="flex-1 py-6 text-base font-sans tracking-wide"
                        onClick={handleAddToCart}
                        disabled={isAdded}
                    >
                        {isAdded ? (
                            <>
                                <Check className="h-5 w-5 mr-2" />
                                Toegevoegd aan favorieten
                            </>
                        ) : (
                            <>
                                <Star className="h-5 w-5 mr-2" />
                                Toevoegen aan favorieten
                            </>
                        )}
                    </Button>

                    <Button
                        size="lg"
                        className="flex-1 py-6 text-base font-sans tracking-wide"
                        asChild
                    >
                        <Link href={etsyUrl} target="_blank">
                            <FaEtsy className="h-5 w-5 mr-2" />
                            Kopen op Etsy
                        </Link>
                    </Button>
                </div>
            )}
            <Button
                size="lg"
                variant="outline"
                className="px-4"
            >
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Delen</span>
            </Button>
        </div>
    )
}

export default DetailsActions