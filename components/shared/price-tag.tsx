import { FC } from "react"
import { cn, formatPrice } from "@/lib/utils"
import { getSalePrice, normalizeDiscountPercent } from "@/lib/shop/discount"

interface Props {
    // Normal price of the work
    price: number
    discountPercent?: number | null
    // Classes for the price to pay (size, weight)
    className?: string
    // Show the "-20%" pill next to the price
    showPercent?: boolean
}

// Price of a work; when it is on sale the normal price is struck through
const PriceTag: FC<Props> = ({ price, discountPercent, className, showPercent = false }) => {
    const percent = normalizeDiscountPercent(discountPercent)

    if (!percent) {
        return <span className={cn("text-foreground", className)}>{formatPrice(price)}</span>
    }

    return (
        <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className={cn("text-red-800", className)}>
                <span className="sr-only">Nu </span>
                {formatPrice(getSalePrice(price, percent))}
            </span>
            <s className="text-muted-foreground font-sans text-sm">
                <span className="sr-only">in plaats van </span>
                {formatPrice(price)}
            </s>
            {showPercent && <SaleBadge percent={percent} className="self-center" />}
        </span>
    )
}

// For order lines, where the prices are a snapshot from the moment of ordering
export const OrderLinePrice: FC<{ price: number; originalPrice: number | null; className?: string }> = ({
    price,
    originalPrice,
    className,
}) => (
    <span className={cn("inline-flex flex-col items-end", className)}>
        {originalPrice != null && originalPrice > price + 0.001 && (
            <s className="text-xs text-muted-foreground font-sans font-normal">
                <span className="sr-only">in plaats van </span>
                {formatPrice(originalPrice)}
            </s>
        )}
        <span>{formatPrice(price)}</span>
    </span>
)

export const SaleBadge: FC<{ percent: number; className?: string }> = ({ percent, className }) => (
    <span
        className={cn(
            "inline-block px-2.5 py-0.5 text-xs font-sans font-semibold tracking-wide bg-red-800 text-white rounded-full",
            className
        )}
    >
        -{percent}%
    </span>
)

export default PriceTag
