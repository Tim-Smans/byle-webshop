'use client'

import { FC, useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image"
import { ArtPiece, Collection, Product } from "@/lib/types";
import { useFavorites } from "@/lib/context/favorites-context";
import { deleteArtPiece, getArtPieces, isArtPieceFeatured, toggleArtPieceSold } from "@/lib/services/art-piece-service";
import { Heart, Pencil, ShoppingBasket, Star, TrashIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCollections } from "@/lib/services/collection-service";
import { toggleArtPieceFeatured } from "@/lib/services/art-piece-service";
import WarningDialog from "@/components/dialogs/warning-dialog";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useFeedback } from "@/lib/context/feedback-context";
import { FaStar } from "react-icons/fa";
import { useAdmin } from "@/lib/hooks/use-admin";
import { primeCache } from "@/lib/client/image-cache";

const ShopComponent: FC = () => {
    const searchParams = useSearchParams();

    const [artPieces, setArtPieces] = useState<ArtPiece[]>([])
    const pageFromUrl = Number(searchParams.get("page")) || 1;
    const [currentPage, setCurrentPage] = useState<number>(pageFromUrl)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [collections, setCollections] = useState<Collection[]>([])
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [artPieceToDelete, setArtPieceToDelete] = useState<string | null>(null);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all")

    const { showError } = useFeedback();
    const isAdmin = useAdmin();

    const ITEMS_PER_PAGE = 6

    const router = useRouter();

    useEffect(() => {
        const collectionIdFromUrl = searchParams.get("collectionId")

        if (collectionIdFromUrl) {
            setSelectedCollectionId(collectionIdFromUrl)
        }
    }, [searchParams])

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        params.set("page", currentPage.toString());

        if (selectedCollectionId !== "all") {
            params.set("collectionId", selectedCollectionId);
        } else {
            params.delete("collectionId");
        }

        router.replace(`/gallery?${params.toString()}`, {
            scroll: false,
        });
    }, [currentPage, selectedCollectionId]);

    const handleToggleFeatured = async (id: string) => {
        var artPieceFeatured = await isArtPieceFeatured(id)

        if (artPieces.filter(x => x.isFeatured).length >= 6 && !artPieceFeatured) {
            showError('Je mag maar maximaal 6 uitgelichte stukken selecteren, haal wat oude stukken weg voor je er nieuwe selecteerd.');
            return
        }

        setArtPieces((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
            )
        );

        try {
            await toggleArtPieceFeatured(id);
        } catch (err) {
            console.error(err);

            setArtPieces((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
                )
            );
        }
    };

    const handleDeleteArtPiece = async (id: string) => {
        setArtPieces((prev) => prev.filter((p) => p.id !== id))

        var error = await deleteArtPiece(id)

        if (error != undefined) {
            showError('Er ging iets mis bij het verwijderen van kunstwerk met id: ' + id)
        }
    }

    const handleSold = async (id: string) => {
        // optimistic update
        setArtPieces((prev) =>
            prev.map((p) =>
                p.id === id
                    ? { ...p, isSold: !p.isSold }
                    : p
            )
        );

        try {
            await toggleArtPieceSold(id);
        } catch (err) {
            console.error(err);

            // rollback bij error
            setArtPieces((prev) =>
                prev.map((p) =>
                    p.id === id
                        ? { ...p, isSold: !p.isSold }
                        : p
                )
            );

            showError("Er ging iets mis bij het aanpassen van de verkoopstatus.");
        }
    };

    const filteredArtPieces = artPieces.filter((piece) => {
        const matchesSearch =
            piece.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            piece.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
            piece.labels.some(label =>
                label.title.toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesCollection =
            selectedCollectionId === "all" ||
            piece.collectionId === selectedCollectionId;

        return matchesSearch && matchesCollection;
    });

    const totalPages = Math.ceil(filteredArtPieces.length / ITEMS_PER_PAGE);

    const paginatedArtPieces = filteredArtPieces.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Background-prime HQ cache for visible artworks so detail page loads instantly
    useEffect(() => {
        paginatedArtPieces.forEach((piece) => {
            const thumbnail = [...piece.images].sort((a, b) => a.index - b.index)[0];
            if (thumbnail?.url) {
                primeCache(thumbnail.url);
            }
        });
    }, [paginatedArtPieces]);

    const { addItem } = useFavorites();

    const handleAddItem = (product: Product) => {
        addItem(product, 1)
    }

    const handleNavigateToDetail = (url: string) => {
        localStorage.setItem(
            "shopScrollPosition",
            window.scrollY.toString()
        );

        router.push(url);
    };

    useEffect(() => {
        if (artPieces.length === 0) return;

        const savedScrollPosition = localStorage.getItem("shopScrollPosition");

        if (savedScrollPosition) {
            window.scrollTo({
                top: Number(savedScrollPosition),
                behavior: "instant" as ScrollBehavior,
            });

            localStorage.removeItem("shopScrollPosition");
        }
    }, [artPieces]);

    useEffect(() => {
        const page = Number(searchParams.get("page")) || 1;
        setCurrentPage(page);
    }, [searchParams]);

    useEffect(() => {
        const loadData = async () => {
            const artPieces = await getArtPieces();
            const collections = await getCollections();

            if (artPieces) {
                console.log(artPieces)
                const sortedArtPieces = [...artPieces].sort((a, b) => {
                    // First show the items that are still availble
                    if (a.isSold !== b.isSold) {
                        return Number(a.isSold) - Number(b.isSold);
                    }

                    // Then sort on creation time
                    return (
                        new Date(b.creationTime).getTime() -
                        new Date(a.creationTime).getTime()
                    );
                });
                setArtPieces(sortedArtPieces);
            }

            if (collections) {
                setCollections(collections)
            }
        }

        loadData();
    }, [])

    const isNewArtPiece = (creationTime: string) => {
        const createdDate = new Date(creationTime);
        const now = new Date();

        const diffInMs = now.getTime() - createdDate.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        return diffInDays <= 3;
    };

    return (
        <section id="shop" className="py-24 bg-muted/30">
            <div className="mx-auto max-w-7xl px-8 lg:px-8 mt-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
                        Kijk rond tussen mijn kunstwerken
                    </p>
                    <h2 className="text-oker text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-4">
                        Gallery / Works
                    </h2>
                    <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
                        Ontdek mijn unieke creaties, stuk voor stuk met liefde en zorg handgemaakt. Laat je inspireren door de warme details,
                        zachte kleuren en creatieve afwerking. Gebruik de filters om rustig rond te kijken tussen al mijn werken.
                    </p>
                    {
                        isAdmin ?
                            <Button asChild className="max-w-2xl mx-auto mt-5 p-6">
                                <Link href={'admin/artpiece/create'}>
                                    Voeg nieuw kunstwerk toe
                                </Link>
                            </Button>
                            : null
                    }
                </div>

                <div className="mb-10 w-full flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Zoek op titel, artiest of label..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setCurrentPage(1);
                        }}
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

                    <select
                        value={selectedCollectionId}
                        onChange={(e) => {
                            const value = e.target.value;

                            setSelectedCollectionId(value);
                            setCurrentPage(1);

                            if (value === "all") {
                                router.push("/gallery");
                            } else {
                                router.push(`/gallery?collectionId=${value}`);
                            }
                        }}
                        className="
                            w-full sm:w-auto sm:min-w-[240px]
                            px-4
                            py-3
                            border
                            rounded-lg
                            bg-background
                            focus:outline-none
                            focus:ring-2
                            focus:ring-primary
                        "
                    >
                        <option value="all">
                            Alle collecties
                        </option>

                        {collections.map((collection) => (
                            <option
                                key={collection.id}
                                value={collection.id}
                            >
                                {collection.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Art Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedArtPieces.map((piece) => {
                        const thumbnailImage = [...piece.images].sort(
                            (a, b) => a.index - b.index
                        )[0];

                        return (
                            <div
                                key={piece.id}
                                className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                                onClick={() => handleNavigateToDetail(`/art/${piece.id}?page=${currentPage}${selectedCollectionId !== "all" ? `&collectionId=${selectedCollectionId}` : ""}`)}
                            >
                                {/* Image Container — vaste hoogte, volledig kunstwerk zichtbaar */}
                                <div className="relative h-[440px] overflow-hidden bg-black">

                                    {/* Geblurde achtergrond (museum-matte effect) */}
                                    <Image
                                        src={thumbnailImage?.url ?? ""}
                                        alt=""
                                        fill
                                        aria-hidden
                                        sizes="100px"
                                        className="object-cover scale-110 blur-xl brightness-40 saturate-75"
                                    />

                                    {/* Hoofdafbeelding — object-contain zodat alles zichtbaar blijft */}
                                    <Image
                                        src={thumbnailImage?.url ?? ""}
                                        alt={piece.title}
                                        fill
                                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        priority={false}
                                    />

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300">
                                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-10 w-10 rounded-full bg-foreground/90 backdrop-blur-sm hover:bg-foreground"
                                                onClick={(e) => { e.stopPropagation(); handleAddItem({ ...piece }); }}
                                            >
                                                <Heart
                                                    className={`h-5 w-5`}
                                                />
                                                <span className="sr-only">Add to favorites</span>
                                            </Button>
                                            {
                                                isAdmin ?
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className={`h-10 w-10 rounded-full backdrop-blur-sm ${piece.isFeatured
                                                                ? "bg-yellow-500 hover:bg-yellow-600"
                                                                : "bg-foreground/90 hover:bg-foreground"
                                                                }`}
                                                            onClick={(e) => { e.stopPropagation(); handleToggleFeatured(piece.id); }}
                                                        >
                                                            {piece.isFeatured ? <FaStar /> : <Star />}
                                                            <span className="sr-only">Toggle featured</span>
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="h-10 w-10 rounded-full backdrop-blur-sm bg-red-500 hover:bg-red-600"
                                                            onClick={(e) => { e.stopPropagation(); setArtPieceToDelete(piece.id); setDeleteDialogOpen(true); }}
                                                        >
                                                            <TrashIcon />
                                                            <span className="sr-only">Verwijder kunstwerk</span>
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className={`h-10 w-10 rounded-full backdrop-blur-sm bg-green-500 hover:bg-green-600`}
                                                            asChild
                                                        >
                                                            <Link href={'admin/artpiece/' + piece.id} onClick={(e) => e.stopPropagation()}>
                                                                <Pencil />
                                                                <span className="sr-only">Update kunstwerk</span>
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className={`h-10 w-10 rounded-full backdrop-blur-sm bg-blue-500 hover:bg-blue-600`}
                                                            onClick={(e) => { e.stopPropagation(); handleSold(piece.id); }}
                                                        >
                                                            <ShoppingBasket />
                                                            <span className="sr-only">Stuk verkocht</span>
                                                        </Button>
                                                    </>
                                                    : null
                                            }
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        {piece.labels?.length > 0 && (
                                            <span className="px-3 py-1 text-xs font-sans font-medium tracking-wide bg-background/90 backdrop-blur-sm rounded-full">
                                                {piece.labels[0].title}
                                            </span>
                                        )}
                                        {isNewArtPiece(piece.creationTime) && (
                                            <span className="px-3 py-1 text-xs font-bold tracking-wide bg-oker text-white rounded-full shadow">
                                                NEW
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-5">
                                    <h3 className="text-lg font-medium text-foreground leading-snug">
                                        {piece.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-sans mt-0.5">
                                        {piece.artist} · {piece.dimensions}
                                    </p>
                                    <div className="flex items-center justify-between mt-4">
                                        {piece.isSold ? (
                                            <span className="text-xs font-sans tracking-widest uppercase text-muted-foreground/60">
                                                niet beschikbaar
                                            </span>
                                        ) : (
                                            <span className="text-lg font-light text-foreground">
                                                € {piece.price.toLocaleString("en-US")}
                                            </span>
                                        )}
                                        <button
                                            className="text-xs font-sans tracking-wide text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                                            onClick={(e) => { e.stopPropagation(); handleNavigateToDetail(`/art/${piece.id}?page=${currentPage}${selectedCollectionId !== "all" ? `&collectionId=${selectedCollectionId}` : ""}`); }}
                                        >
                                            Bekijk details →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
                                        text="Vorige"
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
                                        text="Volgende"
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            <WarningDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                message="Ben je zeker dat je dit kunstwerk wilt verwijderen? Deze actie kan niet ongedaan gemaakt worden."
                onConfirm={() => {
                    if (artPieceToDelete) {
                        handleDeleteArtPiece(artPieceToDelete);
                    }
                }}
            />
        </section>
    )
}

export default ShopComponent