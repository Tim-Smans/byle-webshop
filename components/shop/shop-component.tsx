'use client'

import { FC, useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image"
import { ArtPiece, Product } from "@/lib/types";
import { useFavorites } from "@/lib/context/favorites-context";
import { getArtPieces } from "@/lib/services/art-piece-service";
import { Heart } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const ShopComponent: FC = () => {
    const [artPieces, setArtPieces] = useState<ArtPiece[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [searchTerm, setSearchTerm] = useState<string>("")

    const ITEMS_PER_PAGE = 6

    const filteredArtPieces = artPieces.filter((piece) =>
        piece.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        piece.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        piece.collection?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        piece.labels.some(label =>
            label.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalPages = Math.ceil(filteredArtPieces.length / ITEMS_PER_PAGE);

    const paginatedArtPieces = filteredArtPieces.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const { addItem } = useFavorites();

    const handleAddItem = (product: Product) => {
        addItem(product, 1)
    }

    useEffect(() => {
        const getArtPiecesFromDb = async () => {
            const artPieces = await getArtPieces();

            if (artPieces) {
                setArtPieces(artPieces)
            }
        }

        getArtPiecesFromDb();
    }, [])

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <section id="shop" className="py-24 bg-muted/30">
            <div className="mx-auto max-w-7xl px-8 lg:px-8 mt-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
                        Browse my collection
                    </p>
                    <h2 className="text-oker text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-4">
                        My <span className="italic font-medium">Shop</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
                        Discover all of my works, each one a testament to the beauty
                        of handcrafted artistry. You can use the filters to make your browsing experience more.
                    </p>
                </div>

                <div className="mb-10 w-full">
                    <input
                        type="text"
                        placeholder="Search by title, artist or label..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="
                            w-full
                            px-4
                            py-3
                            border
                            rounded-lg
                            bg-background
                            focus:outline-none
                            focus:ring-2
                            focus:ring-primary"
                    />
                </div>

                {/* Art Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedArtPieces.map((piece) => (
                        <div
                            key={piece.id}
                            className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-3/4 overflow-hidden">
                                <Image
                                    src={piece.images[0].url}
                                    alt={piece.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300">
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-10 w-10 rounded-full bg-foreground/90 backdrop-blur-sm hover:bg-foreground"
                                            onClick={() => handleAddItem({ ...piece })}
                                        >
                                            <Heart
                                                className={`h-5 w-5`}
                                            />
                                            <span className="sr-only">Add to favorites</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Category Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 text-xs font-sans font-medium tracking-wide bg-background/90 backdrop-blur-sm rounded-full">
                                        {piece.labels[0].title}
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-xl font-medium text-foreground">
                                            {piece.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground font-sans">
                                            by {piece.artist} · {piece.dimensions}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-2xl font-light text-foreground">
                                        ${piece.price.toLocaleString("en-US")}
                                    </p>
                                    <Link href={`/art/${piece.id}`}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="font-sans text-sm tracking-wide"
                                        >
                                            View Details
                                        </Button>
                                    </Link>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                {/* Previous */}
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                                        }
                                        className={
                                            currentPage === 1
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>

                                {/* Page numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                    (page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                isActive={page === currentPage}
                                                onClick={() => setCurrentPage(page)}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                )}

                                {/* Next */}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(prev + 1, totalPages)
                                            )
                                        }
                                        className={
                                            currentPage === totalPages
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </section>
    )
}

export default ShopComponent