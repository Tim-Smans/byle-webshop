"use client"

import Image from "next/image"
import Link from "next/link"
import { FC } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CartItem } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

interface Props {
    item: CartItem
    onRemove: () => void
    onNavigate?: () => void
}

const availabilityText: Record<Exclude<CartItem["availability"], "available">, string> = {
    sold: "Dit werk is intussen verkocht",
    reserved: "Iemand rekent dit werk momenteel af",
}

const CartLine: FC<Props> = ({ item, onRemove, onNavigate }) => {
    const isAvailable = item.availability === "available"

    return (
        <div className={`flex gap-4 p-4 rounded-lg ${isAvailable ? "bg-muted/30" : "bg-muted/60"}`}>
            <Link
                href={`/art/${item.artPieceId}`}
                onClick={onNavigate}
                className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-muted ${isAvailable ? "" : "opacity-50"}`}
            >
                {item.imageUrl && (
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                    />
                )}
            </Link>

            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                        <Link
                            href={`/art/${item.artPieceId}`}
                            onClick={onNavigate}
                            className="font-medium text-foreground hover:underline underline-offset-4"
                        >
                            {item.title}
                        </Link>
                        <p className="text-sm text-muted-foreground font-sans">
                            {item.dimensions}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mt-1 -mr-2 shrink-0"
                        onClick={onRemove}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Verwijder uit winkelmand</span>
                    </Button>
                </div>

                <div className="mt-auto pt-2">
                    {item.availability === "available" ? (
                        <>
                            <p className="font-medium">{formatPrice(item.price)}</p>
                            {item.reservedByMe && (
                                <p className="text-xs font-sans text-muted-foreground">
                                    Je was dit werk aan het afrekenen, het is nog even voor jou gereserveerd.
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm font-sans text-red-700">
                            {availabilityText[item.availability]}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CartLine
