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
                            Mijn <span className="italic font-medium">collecties</span>
                        </h2>
                    </div>
                    <p className="max-w-xl text-muted-foreground text-lg leading-8 lg:text-right">
                        Ontdek mijn intuïtieve kunst, waar gevoel, kleur en vorm samenkomen in unieke creaties. Van abstracte schilderijen tot karaktervolle sculpturen: elk werk wordt zorgvuldig, geduldig met de hand gemaakt en draagt een eigen verhaal en uitstraling. Laat u inspireren door kunst die warmte, sfeer en persoonlijkheid toevoegt aan uw interieur.
                    </p>
                </div>

                {/* Collections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {collections.map((collection) => (
                        <div
                            key={collection.id}
                            className="group relative overflow-hidden rounded-lg cursor-pointer"
                        >
                            <div className="relative min-h-[280px] md:aspect-[4/3]">
                                <Image
                                    src={collection.thumbnailUrl}
                                    alt={collection.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

                                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                                    <h3 className="text-2xl sm:text-3xl font-medium text-background mb-2">
                                        {collection.title}
                                    </h3>

                                    <p className="text-background/80 text-base mb-4 line-clamp-3 md:line-clamp-none">
                                        {collection.description}
                                    </p>

                                    <Link href={`/gallery?collectionId=${collection.id}`}>
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