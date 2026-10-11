import { ArtPiece } from "@/lib/types"
import { FC } from "react"
import { Button } from "../ui/button"
import { useFavorites } from "@/lib/context/favorites-context"
import { useCart } from "@/lib/context/cart-context"
import { getAvailability } from "@/lib/shop/availability"
import { Check, Heart, Share2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { usePendingOrder } from "@/lib/orders/pending-order"

interface Props {
    artPiece: ArtPiece
}

const DetailsActions: FC<Props> = ({ artPiece }) => {
    const { toggleItem, isFavorite } = useFavorites()
    const { addItem, isInCart, openCart } = useCart()

    const pendingOrder = usePendingOrder()
    const reservedByMe = !!pendingOrder && artPiece.reservedByOrderId === pendingOrder.orderId
    // Your own unfinished checkout doesn't block you: a new checkout cancels it
    const availability = reservedByMe ? "available" : getAvailability(artPiece)
    const favorite = isFavorite(artPiece.id)

    const mainButtonClass = "flex-1 py-6 text-base font-sans tracking-wide"

    return (
        <div className="mb-8">
            <div className="flex gap-3">
                {availability === "sold" ? (
                    <Button size="lg" className={mainButtonClass} disabled>
                        Niet meer beschikbaar
                    </Button>
                ) : availability === "reserved" ? (
                    <Button size="lg" className={mainButtonClass} disabled>
                        Tijdelijk gereserveerd
                    </Button>
                ) : isInCart(artPiece.id) && reservedByMe ? (
                    <Button size="lg" className={mainButtonClass} asChild>
                        <Link href="/afrekenen">Verder afrekenen</Link>
                    </Button>
                ) : isInCart(artPiece.id) ? (
                    <Button size="lg" variant="outline" className={mainButtonClass} onClick={openCart}>
                        <Check className="h-5 w-5 mr-2" />
                        In je winkelmand
                    </Button>
                ) : (
                    <Button size="lg" className={mainButtonClass} onClick={() => addItem(artPiece.id)}>
                        <ShoppingBag className="h-5 w-5 mr-2" />
                        In winkelmand
                    </Button>
                )}

                <Button
                    size="lg"
                    variant="outline"
                    className="px-4"
                    onClick={() => toggleItem({ ...artPiece })}
                    aria-pressed={favorite}
                >
                    <Heart className={`h-5 w-5 ${favorite ? "fill-current" : ""}`} />
                    <span className="sr-only">
                        {favorite ? "Verwijder uit favorieten" : "Bewaar als favoriet"}
                    </span>
                </Button>

                <Button
                    size="lg"
                    variant="outline"
                    className="px-4"
                >
                    <Share2 className="h-5 w-5" />
                    <span className="sr-only">Delen</span>
                </Button>
            </div>

            {availability === "reserved" && (
                <p className="mt-3 text-sm font-sans text-muted-foreground">
                    Iemand rekent dit werk momenteel af. Kijk over een half uurtje opnieuw.
                </p>
            )}
        </div>
    )
}

export default DetailsActions
