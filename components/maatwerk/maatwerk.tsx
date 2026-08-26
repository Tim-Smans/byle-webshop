import { FC } from "react"
import { Mail } from "lucide-react"
import StepsCarousel from "./steps-carousel"

const Maatwerk: FC = () => {
    return (
        <main className="min-h-screen pt-24 pb-16">
            {/* Hero */}
            <section className="relative overflow-hidden py-16 md:py-20">
                <div className="absolute top-10 left-10 w-56 h-56 bg-secondary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

                <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center relative z-10">
                    <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
                        Kunstwerk op maat
                    </p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-oker text-balance">
                        Van jouw wens, door mijn handen, <br />
                        <span className="italic font-medium">tot een uniek kunstwerk</span>
                    </h1>
                </div>
            </section>

            {/* Jouw idee, intuïtief tot leven gebracht */}
            <section className="mx-auto max-w-4xl px-6 lg:px-8 py-12">
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-oker mb-8">
                    Jouw idee, intuïtief tot leven gebracht
                </h2>

                <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                    <p>
                        Soms zoek je geen kunstwerk dat al bestaat, maar iets dat speciaal voor jou mag ontstaan.
                    </p>
                    <p>
                        Een bepaalde sfeer. Kleuren die bij je interieur passen. Een herinnering, persoon, dier of verhaal dat je graag op een bijzondere manier wilt laten vertalen.
                    </p>
                    <p>
                        Bij Art by Lé kan je terecht voor een uniek schilderij of handgemaakt beeld op maat.
                    </p>
                    <p>
                        Ik werk niet vanuit een vaste mal en maak geen exacte kopieën. Elk werk ontstaat intuïtief, laag voor laag, vanuit jouw idee en met voldoende creatieve vrijheid om er een echt Art by Lé-werk van te maken.
                    </p>
                    <p className="font-medium text-foreground">
                        Geen twee werken zijn hetzelfde.
                    </p>
                </div>
            </section>

            {/* Schilderij op maat */}
            <section className="bg-muted/30">
                <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16">
                    <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-oker mb-8">
                        Schilderij op maat
                    </h2>

                    <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                        <p>
                            Een schilderij op maat wordt afgestemd op jouw wensen wat betreft formaat, kleuren, sfeer en materialen.
                        </p>
                        <p>
                            Dat kan rustig en natuurlijk zijn, rijk aan textuur en gelaagdheid, of net wat krachtiger en expressiever.
                        </p>
                        <p>
                            Vooraf bespreken we welke richting je graag uit wilt. Daarna laat ik het schilderij tijdens het creëren intuïtief groeien.
                        </p>
                        <p>
                            Je geeft dus het vertrekpunt aan, maar het uiteindelijke werk ontstaat laag voor laag vanuit het proces.
                        </p>
                    </div>
                </div>
            </section>

            {/* Beeld op maat */}
            <section className="mx-auto max-w-4xl px-6 lg:px-8 py-16">
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-oker mb-8">
                    Beeld op maat
                </h2>

                <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                    <p>
                        Ook een beeld kan volledig vanuit jouw verhaal of idee ontstaan.
                    </p>
                    <p>
                        Dat kan bijvoorbeeld vertrekken vanuit een persoon, dier, herinnering, symboliek of bepaalde sfeer.
                    </p>
                    <p>
                        Elk beeld wordt met de hand opgebouwd en persoonlijk uitgewerkt met verschillende materialen, structuren en details.
                    </p>
                    <p>
                        Er wordt niet gewerkt met een mal of standaardmodel. Daardoor ontstaat telkens één uniek stuk met een eigen karakter.
                    </p>
                </div>
            </section>

            {/* Wat kost een kunstwerk op maat? */}
            <section className="bg-muted/30">
                <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16">
                    <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-oker mb-8">
                        Wat kost een kunstwerk op maat?
                    </h2>

                    <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                        <p>
                            Ieder kunstwerk is anders. Daarom hangt de uiteindelijke prijs af van onder andere het formaat, de gebruikte materialen, de complexiteit, constructie en gewenste uitwerking.
                        </p>
                        <p>
                            Voor we starten, bespreken we altijd eerst een richtprijs. Zo weet je vooraf binnen welke prijsklasse jouw kunstwerk zal vallen.
                        </p>
                        <p>
                            De prijzen van vergelijkbare werken in mijn galerij en mijn richtprijzen voor maatwerk geven alvast een goede indicatie.
                        </p>
                    </div>

                    <div className="mt-12 pt-10 border-t border-border/40">
                        <h3 className="text-2xl sm:text-3xl font-light tracking-tight text-foreground mb-6">
                            Een uniek werk, <span className="italic font-medium">geen dertien-in-een-dozijn</span>
                        </h3>

                        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                            <p>
                                Een kunstwerk op maat van Art by Lé betekent niet dat je een bestaand ontwerp kiest dat vervolgens wordt nagemaakt.
                            </p>
                            <p>
                                Het betekent dat jouw verhaal het vertrekpunt wordt voor een nieuw kunstwerk.
                            </p>
                            <p className="text-foreground font-medium">
                                Handgemaakt.
                                <br />
                                Intuïtief opgebouwd.
                                <br />
                                Persoonlijk uitgewerkt.
                                <br />
                                En maar één keer bestaand.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Heb jij een idee? */}
            <section className="mx-auto max-w-4xl px-6 lg:px-8 py-16">
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-oker mb-8">
                    Heb jij een idee?
                </h2>

                <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
                    <p>
                        Heb je al iets heel concreets in gedachten? Of alleen een gevoel, kleur, herinnering of verhaal waarvan je je afvraagt of ik er iets mee kan?
                    </p>
                    <p>
                        Vertel het me gerust.
                    </p>
                    <p>
                        We bekijken samen wat mogelijk is en of jouw idee bij mijn manier van werken past.
                    </p>
                    <p>
                        Een eerste vraag is altijd vrijblijvend.
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
                    Kunst die ontstaat vanuit gevoel en misschien binnenkort vanuit jouw verhaal.
                </p>
            </section>

            {/* Foto's / carousel */}
            <section className="mx-auto max-w-6xl px-6 lg:px-8 pt-6 pb-8">
                <StepsCarousel />
            </section>
        </main>
    )
}

export default Maatwerk
