import { ArtPiece } from "@/lib/types"
import { FC } from "react"

interface Props {
    artPiece: ArtPiece
}

const Specifications: FC<Props> = ({ artPiece }) => {
    const specifications = [
        { label: "Afmetingen", value: artPiece.dimensions },
        { label: "Inlijsting", value: artPiece.frame },
        { label: "Structuur", value: artPiece.structure },
        { label: "Presentatie", value: artPiece.presentation },
        { label: "Editie", value: artPiece.edition },
        { label: "Afwerking", value: artPiece.finish },
    ]

    return (
        <div>
            <h3 className="text-sm font-sans font-medium tracking-wide uppercase text-muted-foreground mb-4">
                Specificaties
            </h3>
            <dl className="space-y-3">
                {specifications.map((spec) => (
                    <div key={spec.label} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border/50 gap-0.5 sm:gap-0">
                        <dt className="text-muted-foreground font-bold font-sans text-sm">{spec.label}</dt>
                        <dd className="text-foreground font-sans text-sm sm:text-right">{spec.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    )
}

export default Specifications