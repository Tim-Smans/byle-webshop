import { ArtPiece } from "@/lib/types";
import { FC, useState } from "react";
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ExpandedImageModal from "./expanded-image-modal";

interface Props {
    artPiece: ArtPiece
}

const ImageGalery: FC<Props> = ({artPiece}) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
    const [isImageExpanded, setIsImageExpanded] = useState<boolean>(false)

    const nextImage = () => {
        setSelectedImageIndex((prev) =>
            prev === artPiece.images.length - 1 ? 0 : prev + 1
        )
    }

    const prevImage = () => {
        setSelectedImageIndex((prev) =>
            prev === 0 ? artPiece.images.length - 1 : prev - 1
        )
    }

    return (
        <>
            <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden group">
                    <Image
                        src={artPiece.images[selectedImageIndex]?.url || ""}
                        alt={artPiece.title}
                        fill
                        className="object-cover"
                        priority
                    />

                    {/* Image Navigation */}
                    {artPiece.images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}

                    {/* Expand Button */}
                    <button
                        onClick={() => setIsImageExpanded(true)}
                        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    >
                        <Expand className="h-5 w-5" />
                    </button>

                    {/* Sold Badge */}
                    {artPiece.isSold && (
                        <div className="absolute top-4 left-4">
                            <Badge variant="secondary" className="bg-foreground text-background font-sans">
                                Sold
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Thumbnail Gallery */}
                {artPiece.images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {artPiece.images.map((image, index) => (
                            <button
                                key={image.id}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden transition-all ${selectedImageIndex === index
                                    ? "ring-2 ring-primary ring-offset-2"
                                    : "opacity-70 hover:opacity-100"
                                    }`}
                            >
                                <Image
                                    src={image.url}
                                    alt={`${artPiece.title} - View ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Expanded Image Modal */}
            <ExpandedImageModal
                artPiece={artPiece}
                selectedImageIndex={selectedImageIndex}
                isOpen={isImageExpanded}
                onClose={() => setIsImageExpanded(false)}
                onNext={nextImage}
                onPrev={prevImage}
            />
        </>
    )
}

export default ImageGalery