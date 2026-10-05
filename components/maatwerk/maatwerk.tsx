import { FC } from "react"
import { Mail } from "lucide-react"
import Image from "next/image"
import StepsCarousel from "./steps-carousel"

const sculpturePrices = [
    { title: "Klein & eenvoudig – tot ± 25 cm", price: "vanaf €125", description: "Eén figuur of een eenvoudige compositie." },
    { title: "Middelgroot – ± 25 tot 35 cm", price: "vanaf €175", description: "Meer details en een persoonlijkere uitwerking." },
    { title: "Complex werk", price: "vanaf €250", description: "Meerdere figuren of elementen, een uitgebreidere constructie en meer afwerking." },
    { title: "Statement piece", price: "vanaf €350", description: "Een groter, uniek werk met complexe handopbouw en veel detail." },
]

const paintingPrices = [
    { title: "Kleinere werken", price: "vanaf ongeveer €95" },
    { title: "Middelgrote werken", price: "meestal tussen €150 en €225" },
    { title: "Grotere of meer complexe mixed-media werken", price: "vanaf ongeveer €250" },
]

const conditions = [
    {
        title: "Aanbetaling",
        paragraphs: [
            "Na akkoord wordt een aanbetaling van 25% gevraagd.",
            "Zodra deze ontvangen is, wordt de opdracht ingepland en kan ik de nodige materialen voorzien en starten met het werk.",
        ],
    },
    {
        title: "Resterende betaling",
        paragraphs: [
            "De resterende 75% wordt betaald wanneer het kunstwerk klaar is en vóór verzending of afhaling.",
        ],
    },
    {
        title: "Levertijd",
        paragraphs: [
            "Elk werk wordt volledig met de hand en op mijn eigen tempo opgebouwd. Daarom spreek ik vooraf een verwachte termijn af in plaats van een vaste productietijd.",
            "Bij grotere of complexere werken kan dit meerdere weken duren.",
            "Heb je het kunstwerk nodig voor een specifieke datum, bijvoorbeeld voor een huwelijk, verjaardag, jubileum of andere gelegenheid? Vermeld dit dan vóór de bestelling, zodat we samen kunnen bekijken of dit haalbaar is.",
        ],
    },
    {
        title: "Maatwerk en annuleren",
        paragraphs: [
            "Voor kunstwerken die volgens jouw persoonlijke specificaties worden gemaakt of duidelijk gepersonaliseerd zijn, geldt het wettelijke herroepingsrecht niet.",
            "Na de start van de opdracht kan deze dus niet zomaar worden geannuleerd.",
        ],
    },
    {
        title: "Verzending",
        paragraphs: [
            "Wanneer ik de verzending regel, blijft het kunstwerk mijn verantwoordelijkheid totdat het bij jou is afgeleverd.",
            "Mocht het tijdens het transport verloren gaan of beschadigd raken, neem dan zo snel mogelijk contact met mij op zodat we samen voor een passende oplossing kunnen zorgen.",
        ],
    },
    {
        title: "Beschadiging bij levering",
        paragraphs: [
            "Komt een kunstwerk beschadigd aan, neem dan zo snel mogelijk contact met mij op en bezorg duidelijke foto's van het kunstwerk én de verpakking.",
            "Zo kunnen we samen bekijken wat de beste oplossing is.",
        ],
    },
]

const Maatwerk: FC = () => {
    return (
        <main className="relative min-h-screen pt-24 pb-16">
            {/* Subtle background texture across the whole page */}
            <div
                className="pointer-events-none fixed inset-0 -z-10 opacity-[0.05]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)",
                    backgroundSize: "22px 22px",
                }}
            />

            {/* Hero */}
            <section className="relative overflow-hidden py-16 md:py-20">
                <div className="absolute top-10 left-10 w-56 h-56 bg-secondary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

                <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center relative z-10">
                    <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
                        Art by Lé
                    </p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-oker text-balance">
                        Kunstwerk <span className="italic font-medium">op maat</span>
                    </h1>
                </div>
            </section>

            {/* Intro */}
            <section className="mx-auto max-w-6xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="relative order-1 hidden lg:block">
                        <div className="relative rounded-lg overflow-hidden">
                            <Image
                                src="/images/step1.jpg"
                                alt="Kunstwerk op maat"
                                width={1055}
                                height={1491}
                                sizes="50vw"
                                className="w-full h-auto"
                            />
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-secondary/20 rounded-lg -z-10" />
                        <div className="absolute -top-6 -left-6 w-28 h-28 bg-accent/20 rounded-lg -z-10" />
                    </div>

                    <div className="order-2">
                        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                            <p>
                                Soms zoek je iets dat niet zomaar ergens te vinden is. Een kunstwerk dat past bij een persoon, een herinnering, een bijzondere gelegenheid of gewoon bij een plek in huis.
                            </p>
                            <p>
                                Bij Art by Lé kan je een schilderij of sculptuur op maat laten maken. We bespreken samen jouw idee, de gewenste kleuren, het formaat, de uitstraling en eventuele persoonlijke elementen. Van daaruit laat ik het werk stap voor stap ontstaan in mijn eigen stijl en werkwijze.
                            </p>
                            <p className="font-medium text-foreground">
                                Omdat elk kunstwerk met de hand en intuïtief wordt opgebouwd, is geen enkel werk exact hetzelfde.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Wat kost een kunstwerk op maat? */}
            <section className="relative bg-muted/30 overflow-hidden">
                <div className="absolute top-10 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-10 w-56 h-56 bg-secondary/10 rounded-full blur-3xl" />

                <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16 relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-oker mb-8">
                        Wat kost een kunstwerk op maat?
                    </h2>

                    <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                        <p>
                            Elk kunstwerk wordt persoonlijk en op maat gemaakt. De prijs hangt af van het formaat, de gebruikte materialen, de hoeveelheid detail, de constructie en de gewenste afwerking.
                        </p>
                        <p>
                            Voor mij hoeft originele kunst niet onbereikbaar te zijn. Ik vind het belangrijk dat kunst betaalbaar en toegankelijk blijft, zodat zoveel mogelijk mensen een uniek werk in huis kunnen halen dat echt iets voor hen betekent.
                        </p>
                        <p>
                            Daarom probeer ik mijn prijzen bewust eerlijk te houden, in verhouding tot het formaat, de materialen en het werk dat erin kruipt.
                        </p>
                    </div>
                </div>
            </section>

            {/* Beeld op maat */}
            <section className="mx-auto max-w-6xl px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="relative order-1 hidden lg:block">
                        <div className="relative rounded-lg overflow-hidden">
                            <Image
                                src="/images/step2.jpg"
                                alt="Beeld op maat"
                                width={1055}
                                height={1491}
                                sizes="50vw"
                                className="w-full h-auto"
                            />
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-secondary/20 rounded-lg -z-10" />
                        <div className="absolute -top-6 -left-6 w-28 h-28 bg-accent/20 rounded-lg -z-10" />
                    </div>

                    <div className="order-2">
                        <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-oker mb-8">
                            Beeld op maat
                        </h2>

                        <ul className="space-y-6">
                            {sculpturePrices.map((item) => (
                                <li key={item.title} className="border-b border-border/40 pb-5">
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                        <span className="text-lg text-foreground font-medium">{item.title}</span>
                                        <span className="text-secondary font-medium whitespace-nowrap">{item.price}</span>
                                    </div>
                                    <p className="mt-1 text-muted-foreground leading-relaxed">{item.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Schilderij op maat */}
            <section className="relative bg-muted/30 overflow-hidden">
                <div className="absolute -top-10 -left-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

                <div className="mx-auto max-w-6xl px-6 lg:px-8 py-16 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-oker mb-8">
                                Schilderij op maat
                            </h2>

                            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                                <p>
                                    Een schilderij op maat is mogelijk vanaf ongeveer €95. De prijs wordt vooral bepaald door het formaat, de techniek, de gebruikte materialen en de mate van opbouw en textuur.
                                </p>
                                <p>Als richtlijn:</p>
                            </div>

                            <ul className="mt-6 space-y-4">
                                {paintingPrices.map((item) => (
                                    <li
                                        key={item.title}
                                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border/40 pb-4"
                                    >
                                        <span className="text-lg text-foreground font-medium">{item.title}</span>
                                        <span className="text-secondary font-medium">{item.price}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 space-y-6 text-lg leading-relaxed text-muted-foreground">
                                <p>
                                    De prijzen van vergelijkbare werken in mijn galerij geven daarnaast een goede indicatie van wat je mag verwachten.
                                </p>
                                <p className="font-medium text-foreground">
                                    Voor elk maatwerk wordt vooraf een duidelijke richtprijs besproken, afgestemd op jouw wensen en het gekozen formaat.
                                </p>
                            </div>
                        </div>

                        <div className="relative order-1 lg:order-2 hidden lg:block">
                            <div className="relative rounded-lg overflow-hidden">
                                <Image
                                    src="/images/step3.jpg"
                                    alt="Schilderij op maat"
                                    width={1055}
                                    height={1491}
                                    sizes="50vw"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-accent/20 rounded-lg -z-10" />
                            <div className="absolute -top-6 -right-6 w-28 h-28 bg-secondary/20 rounded-lg -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Hoe verloopt een opdracht? */}
            <section className="mx-auto max-w-4xl px-6 lg:px-8 py-16">
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-oker mb-8">
                    Hoe verloopt een opdracht?
                </h2>

                <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                    <p>
                        Voor ik aan een kunstwerk begin, bespreken we samen jouw idee.
                    </p>
                    <p>Je mag daarbij denken aan:</p>
                    <ul className="space-y-2 list-disc pl-6">
                        <li>het soort kunstwerk: schilderij of sculptuur</li>
                        <li>het gewenste formaat</li>
                        <li>kleuren en sfeer</li>
                        <li>eventuele persoonlijke details of symboliek</li>
                        <li>de gewenste afwerking</li>
                        <li>de datum waarop je het kunstwerk eventueel nodig hebt</li>
                    </ul>
                    <p>
                        Ik werk niet vanuit een volledig vastgelegd ontwerp. Mijn werken groeien laag voor laag en tijdens het maken laat ik ruimte voor intuïtie, materiaal en spontaniteit.
                    </p>
                    <p>
                        Dat betekent dat kleine details, structuren of kleurnuances tijdens het creatieve proces kunnen evolueren. Juist daarin zit het unieke karakter van een handgemaakt kunstwerk.
                    </p>
                </div>
            </section>

            {/* Bestellen & voorwaarden voor maatwerk */}
            <section className="relative bg-muted/30 overflow-hidden">
                <div className="absolute top-10 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

                <div className="mx-auto max-w-6xl px-6 lg:px-8 py-16 relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-oker mb-10">
                        Bestellen & voorwaarden voor maatwerk
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {conditions.map((condition) => (
                            <div
                                key={condition.title}
                                className="rounded-2xl bg-background/60 border border-border/40 p-6 sm:p-8"
                            >
                                <h3 className="text-xl text-foreground font-medium mb-3">
                                    {condition.title}
                                </h3>
                                <div className="space-y-3 text-muted-foreground leading-relaxed">
                                    {condition.paragraphs.map((paragraph) => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 pt-10 border-t border-border/40">
                        <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-foreground mb-6">
                            Handgemaakt <span className="italic font-medium">karakter</span>
                        </h3>

                        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                            <p>
                                Een kunstwerk op maat wordt nooit simpelweg gekopieerd. Ook wanneer een bestaand werk als inspiratie dient, krijgt jouw werk een eigen karakter.
                            </p>
                            <p>
                                Kleuren, structuren en kleine details kunnen tijdens het creatieve proces licht verschillen of evolueren.
                            </p>
                            <p className="text-foreground font-medium">
                                Dat maakt elk werk uniek.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Een idee in gedachten? */}
            <section className="relative overflow-hidden">
                <div className="absolute top-0 left-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

                <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16 relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-oker mb-8">
                        Een idee in gedachten?
                    </h2>

                    <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                        <p>
                            Heb je een bepaald idee, een gelegenheid of een plek waarvoor je graag een persoonlijk kunstwerk wilt laten maken?
                        </p>
                        <p>
                            Neem gerust contact op. We bekijken samen wat mogelijk is, zonder verplichting.
                        </p>
                    </div>

                    <a
                        href="mailto:byle.art@outlook.com"
                        className="inline-flex items-center gap-2 mt-8 text-base font-sans font-medium tracking-wide text-secondary hover:underline"
                    >
                        <Mail className="h-4 w-4" />
                        byle.art@outlook.com
                    </a>

                    <p className="mt-12 text-xl sm:text-2xl italic text-foreground font-light leading-relaxed">
                        Elk werk ontstaat met tijd, zorg en aandacht en wordt speciaal voor jou opgebouwd. Geen enkel kunstwerk is hetzelfde.
                    </p>
                </div>
            </section>

            {/* Foto's / carousel */}
            <section className="mx-auto max-w-6xl px-6 lg:px-8 pt-6 pb-8">
                <StepsCarousel />
            </section>
        </main>
    )
}

export default Maatwerk
