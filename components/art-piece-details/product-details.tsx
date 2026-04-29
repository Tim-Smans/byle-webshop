import { ArtPiece } from "@/lib/types";
import { FC } from "react";
import { Badge } from "../ui/badge";
import { RotateCcw, Shield, Truck } from "lucide-react";
import Specifications from "./specifications";
import DetailsActions from "./details-actions";

interface Props {
    artPiece: ArtPiece
}

const ProductDetails: FC<Props> = ({ artPiece }) => {
    return (
        <div className="flex flex-col">
            {/* Labels */}
            <div className="flex flex-wrap gap-2 mb-4">
                {artPiece.labels.map((label) => (
                    <Badge
                        key={label.id}
                        variant="outline"
                        className="font-sans text-xs tracking-wide"
                    >
                        {label.title}
                    </Badge>
                ))}
            </div>

            {/* Title & Artist */}
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-2">
                {artPiece.title}
            </h1>
            <p className="text-lg text-muted-foreground font-sans mb-6">
                by <span className="text-foreground">{artPiece.artist}</span> · {artPiece.dimensions}
            </p>

            {/* Price */}
            <div className="mb-8">
                <p className="text-4xl font-light text-foreground">
                    ${artPiece.price.toLocaleString()}
                </p>
                {!artPiece.isSold && (
                    <p className="text-sm text-muted-foreground font-sans mt-1">
                        Free shipping worldwide
                    </p>
                )}
            </div>

            {/* Description */}
            <div className="mb-8">
                <h3 className="text-sm font-sans font-medium tracking-wide uppercase text-muted-foreground mb-3">
                    About this piece
                </h3>
                <p className="text-foreground leading-relaxed">
                    {artPiece.description}
                </p>
            </div>

            {/* Actions */}
            <DetailsActions artPiece={artPiece}/>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-border mb-8">
                <div className="flex flex-col items-center text-center">
                    <Truck className="h-5 w-5 text-muted-foreground mb-2" />
                    <span className="text-xs font-sans text-muted-foreground">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center">
                    <Shield className="h-5 w-5 text-muted-foreground mb-2" />
                    <span className="text-xs font-sans text-muted-foreground">Certificate of Authenticity</span>
                </div>
                <div className="flex flex-col items-center text-center">
                    <RotateCcw className="h-5 w-5 text-muted-foreground mb-2" />
                    <span className="text-xs font-sans text-muted-foreground">Sold via Etsy</span>
                </div>
            </div>

            {/* Specifications */}
            <Specifications artPiece={artPiece}/>
        </div>
    )
}

export default ProductDetails