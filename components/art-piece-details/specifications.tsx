import { ArtPiece } from "@/lib/types"
import { FC } from "react"

interface Props {
    artPiece: ArtPiece
}

const Specifications: FC<Props> = ({ artPiece }) => {
    const specifications = [
        { label: "Dimensions", value: artPiece.dimensions },
        { label: "Frame", value: artPiece.frame },
        { label: "Structure", value: artPiece.structure },
        { label: "Presentation", value: artPiece.presentation },
        { label: "Edition", value: artPiece.edition },
        { label: "Finish", value: artPiece.finish },
    ]

    return (
        <div>
            <h3 className="text-sm font-sans font-medium tracking-wide uppercase text-muted-foreground mb-4">
                Specifications
            </h3>
            <dl className="space-y-3">
                {specifications.map((spec) => (
                    <div key={spec.label} className="flex justify-between py-2 border-b border-border/50">
                        <dt className="text-muted-foreground font-sans text-sm">{spec.label}</dt>
                        <dd className="text-foreground font-sans text-sm">{spec.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    )
}

export default Specifications