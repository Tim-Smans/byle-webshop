import { ArtPiece } from "@/lib/types";
import { FC, useState } from "react";
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ExpandedImageModal from "./expanded-image-modal";
import { getOptimizedImageUrl } from "@/lib/utils";

interface Props {
    artPiece: ArtPiece
}

const ImageGalery: FC<Props> = ({ artPiece }) => {
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

    const currentImage = artPiece.images[selectedImageIndex]?.url || ""

    return (
        <>
            <div className="space-y-4">
                {/* Main Image */}
                <div className="relative h-[600px] bg-black rounded-xl overflow-hidden group">

                    {/* Geblurde achtergrond — museum-matte effect */}
                    <Image
                        src={currentImage}
                        alt=""
                        fill
                        aria-hidden
                        className="object-cover scale-110 blur-2xl brightness-[0.35] saturate-75 transition-all duration-500"
                        priority
                    />

                    {/* Hoofdafbeelding — volledig zichtbaar */}
                    {/* Subtiele blur alleen als decoratieve rand — schaal groter zodat geen zwarte hoeken */}
                    <Image
                        src={getOptimizedImageUrl(currentImage, { width: 200, quality: 50})}
                        alt=""
                        fill
                        aria-hidden
                        className="object-cover scale-150 blur brightness-75 saturate-50 opacity-40 transition-all duration-500"
                        priority
                    />

                    {/* Witte/muted overlay zodat het nooit te donker wordt */}
                    <div className="absolute inset-0 bg-muted/60" />

                    {/* Hoofdafbeelding */}
                    <Image
                        src={getOptimizedImageUrl(currentImage, { width: 800, quality: 70})}
                        alt={artPiece.title}
                        fill
                        className="object-contain p-6 transition-all duration-500"
                        priority
                        sizes="(max-width: 768px) 100vw, 60vw"
                    />

                    {/* Image Navigation */}
                    {artPiece.images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 text-white z-10"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 text-white z-10"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}

                    {/* Expand Button */}
                    <button
                        onClick={() => setIsImageExpanded(true)}
                        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 text-white z-10"
                    >
                        <Expand className="h-5 w-5" />
                    </button>

                    {/* Sold Badge */}
                    {artPiece.isSold && (
                        <div className="absolute top-4 left-4 z-10">
                            <Badge variant="secondary" className="bg-foreground text-background font-sans">
                                Niet beschikbaar
                            </Badge>
                        </div>
                    )}

                    {/* Image counter */}
                    {artPiece.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {artPiece.images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImageIndex(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedImageIndex
                                            ? "w-6 bg-white"
                                            : "w-1.5 bg-white/50"
                                        }`}
                                />
                            ))}
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
                                className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden transition-all bg-black ${selectedImageIndex === index
                                        ? "ring-2 ring-primary ring-offset-2"
                                        : "opacity-60 hover:opacity-100"
                                    }`}
                            >
                                {/* Blurred bg voor thumbnails ook */}
                                <Image
                                    src={getOptimizedImageUrl(image.url, { width: 200, quality: 50 })}
                                    alt=""
                                    fill
                                    aria-hidden
                                    className="object-cover blur-md brightness-50 scale-110"
                                />
                                <Image
                                    src={getOptimizedImageUrl(image.url, { width: 600, quality: 50 })}
                                    alt={`${artPiece.title} - View ${index + 1}`}
                                    fill
                                    className="object-contain p-1"
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