'use client'

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Collection } from "@/lib/types";
import { getCollections } from "@/lib/services/collection-service";
import Link from "next/link";

const Collections = () => {
    const [collections, setCollections] = useState<Collection[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const data = await getCollections()

            if (data) {
                setCollections(data)
            }
        }

        loadData();
    }, [])

    return (
        <section id="collections" className="py-24 bg-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
                    <div>
                        <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
                            Kies uw stijl
                        </p>
                        <h2 className="text-4xl text-oker sm:text-5xl font-light tracking-tight text-foreground">
                            Mijn <span className="italic font-medium">Collecties</span>
                        </h2>
                    </div>
                    <p className="max-w-md text-muted-foreground text-lg lg:text-right">
                        Collecties vol stijl, met liefde samengesteld elk met hun eigen verhaal.
                    </p>
                </div>

                {/* Collections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {collections.map((collection, index) => (
                        <div
                            key={collection.id}
                            className={`group relative overflow-hidden rounded-lg cursor-pointer ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
                                }`}
                        >
                            <div className={`relative ${index === 0 ? 'aspect-[4/3] lg:aspect-square' : 'aspect-[4/3]'}`}>
                                <Image
                                    src={collection.thumbnailUrl}
                                    alt={collection.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

                                {/* Content */}
                                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                                    <p className="text-sm font-sans font-medium tracking-wide text-background/70 mb-2">
                                        # pieces
                                    </p>
                                    <h3 className="text-2xl sm:text-3xl font-medium text-background mb-2">
                                        {collection.title}
                                    </h3>
                                    <p className="text-background/80 text-base mb-4">
                                        {collection.description}
                                    </p>
                                    <Link href={`/shop?collectionId=${collection.id}`}>
                                        <div className="flex items-center gap-2 text-background font-sans text-sm font-medium tracking-wide group-hover:gap-3 transition-all">
                                            <span>Kijk eens rond in de collectie</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Collections