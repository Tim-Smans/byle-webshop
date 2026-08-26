"use client"

import Image from "next/image"
import { FC, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSwipe } from "@/hooks/use-swipe"

interface Slide {
    src: string
    caption: string
}

const slides: Slide[] = [
    { src: "/images/step1.jpg", caption: "Jouw idee, intuïtief tot leven gebracht" },
    { src: "/images/step2.jpg", caption: "Beeld op maat" },
    { src: "/images/step3.jpg", caption: "Schilderij op maat" },
    { src: "/images/step4.jpg", caption: "Stap 1 – Jouw idee" },
    { src: "/images/step5.jpg", caption: "Stap 2 – Samen afstemmen" },
    { src: "/images/step6.jpg", caption: "Stap 3 – Bevestiging" },
    { src: "/images/step7.jpg", caption: "Stap 4 – Het creatieve proces" },
    { src: "/images/step8.jpg", caption: "Stap 5 – Vertrouwen in het proces" },
    { src: "/images/step9.jpg", caption: "Stap 6 – De laatste afwerking" },
    { src: "/images/step10.jpg", caption: "Stap 7 – Klaar voor zijn nieuwe thuis" },
]

const StepsCarousel: FC = () => {
    const [index, setIndex] = useState<number>(0)

    const next = () => setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    const prev = () => setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))

    const swipeHandlers = useSwipe(next, prev)

    const current = slides[index]

    return (
        <div className="max-w-3xl mx-auto">
            <div
                className="relative h-[420px] sm:h-[520px] rounded-2xl overflow-hidden bg-black select-none group"
                {...swipeHandlers}
            >
                {/* Blurred backdrop so the full photo can be shown without cropping */}
                <Image
                    src={current.src}
                    alt=""
                    fill
                    aria-hidden
                    sizes="200px"
                    className="object-cover scale-110 blur-2xl brightness-[0.45] saturate-75"
                />

                {/* Full, uncropped photo */}
                <Image
                    key={current.src}
                    src={current.src}
                    alt={current.caption}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-contain transition-opacity duration-500"
                    priority={index === 0}
                />

                {/* Gradient overlay for caption legibility */}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white text-lg sm:text-xl font-light tracking-wide text-center">
                        {current.caption}
                    </p>
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={prev}
                    aria-label="Vorige foto"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 text-white z-10"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    onClick={next}
                    aria-label="Volgende foto"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 text-white z-10"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center flex-wrap gap-1.5 mt-4">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        aria-label={`Ga naar foto ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

export default StepsCarousel
