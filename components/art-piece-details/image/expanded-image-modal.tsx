import { FC } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ArtPiece } from "@/lib/types"

type Props = {
    artPiece: ArtPiece
    selectedImageIndex: number
    isOpen: boolean
    onClose: () => void
    onNext: () => void
    onPrev: () => void
}

const ExpandedImageModal: FC<Props> = ({
    artPiece,
    selectedImageIndex,
    isOpen,
    onClose,
    onNext,
    onPrev
}) => {
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
                <span className="sr-only">Close</span>
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>

            <div className="relative w-full max-w-4xl aspect-[3/4]">
                <Image
                    src={artPiece.images[selectedImageIndex]?.url || ""}
                    alt={artPiece.title}
                    fill
                    className="object-contain"
                />
            </div>

            {artPiece.images.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onPrev()
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onNext()
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </>
            )}
        </div>
    )
}

export default ExpandedImageModal