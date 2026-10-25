"use client"

import { FC } from "react"
import Link from "next/link"
import { TERMS_LAST_UPDATED } from "@/lib/shop/config"
import { TERMS_INTRO, TERMS_SECTIONS } from "@/lib/legal/terms"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface LegalDialogProps {
    triggerText: string
}

export const PrivacyPolicyDialog: FC<LegalDialogProps> = ({
    triggerText,
}) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {triggerText}
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[1000px] max-h-[85vh] overflow-y-auto rounded-[2rem] border-border/50 p-10">       
                <DialogHeader className="mb-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                        Legal
                    </p>

                    <DialogTitle className="text-4xl font-light text-oker">
                        Privacy Policy
                    </DialogTitle>

                    <p className="text-muted-foreground pt-2">
                        Laatst bijgewerkt: 11 oktober 2026
                    </p>
                </DialogHeader>

                <div className="space-y-8 text-muted-foreground leading-relaxed">
                    <p>
                        Welkom bij Art by Lé. Jouw privacy is belangrijk. In dit privacybeleid
                        leg ik uit welke persoonsgegevens via deze website kunnen worden verzameld,
                        waarvoor ze worden gebruikt en hoe hiermee wordt omgegaan.
                    </p>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            1. Wie is verantwoordelijk voor deze website?
                        </h3>

                        <p>
                            Deze website en webshop behoren tot Art by Lé.
                        </p>

                        <p className="mt-3">
                            Voor vragen over privacy of de verwerking van je persoonsgegevens kan
                            je contact opnemen via:
                        </p>

                        <div className="mt-4 p-4 rounded-2xl bg-muted/40 border border-border/40">
                            <p>Art by Lé</p>
                            <p>Hei-Ende 102, 2340 Vlimmeren (Beerse), België</p>
                            <p>Ondernemingsnummer: 1043.462.454</p>
                            <p className="mt-3">E-mail: byle.art@outlook.com</p>
                        </div>

                        <p className="mt-4">
                            De website wordt technisch onderhouden door Tim Smans.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            2. Welke gegevens worden verzameld?
                        </h3>

                        <p>
                            Wanneer je een bestelling plaatst, contact opneemt of gebruikmaakt van
                            de website, kunnen onder andere volgende gegevens worden verwerkt:
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>naam en voornaam</li>
                            <li>e-mailadres</li>
                            <li>telefoonnummer, indien opgegeven</li>
                            <li>factuur- en leveringsadres</li>
                            <li>bedrijfsnaam en btw-nummer, als je als bedrijf bestelt</li>
                            <li>gegevens over je bestelling, betaling, levering en factuur</li>
                            <li>gegevens over een herroeping, retour of terugbetaling</li>
                            <li>je e-mailadres, als je je inschrijft voor de nieuwsbrief</li>
                            <li>informatie die je zelf doorgeeft via e-mail of een contactformulier</li>
                        </ul>

                        <p className="mt-4">
                            Je betaalgegevens, zoals je kaart- of rekeningnummer, worden rechtstreeks
                            door de betaalprovider Mollie verwerkt. Art by Lé krijgt die gegevens niet
                            te zien, alleen of en hoe er betaald werd.
                        </p>

                        <p className="mt-4">
                            Daarnaast worden automatisch beperkte technische gegevens verwerkt, zoals
                            je IP-adres en browsertype (nodig om de website te tonen en te beveiligen)
                            en anonieme bezoekersstatistieken zoals bezochte pagina&apos;s.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            3. Waarvoor worden deze gegevens gebruikt?
                        </h3>

                        <p>
                            Persoonsgegevens worden alleen gebruikt voor doeleinden die nodig zijn
                            voor de werking van Art by Lé, zoals:
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>bestellingen verwerken</li>
                            <li>betalingen afhandelen</li>
                            <li>kunstwerken verzenden of afhaling organiseren</li>
                            <li>contact opnemen over een bestelling</li>
                            <li>vragen of berichten beantwoorden</li>
                            <li>voldoen aan wettelijke en administratieve verplichtingen</li>
                            <li>herroepingen, retours en terugbetalingen afhandelen</li>
                            <li>de nieuwsbrief versturen, als je je daarvoor hebt ingeschreven</li>
                            <li>de website veilig en goed laten functioneren</li>
                            <li>anonieme bezoekersstatistieken bekijken om de website te verbeteren</li>
                        </ul>

                        <p className="mt-4">
                            Dit gebeurt op basis van:
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>de uitvoering van de overeenkomst, voor alles wat met je bestelling te maken heeft</li>
                            <li>een wettelijke verplichting, bijvoorbeeld de boekhoud- en factuurregels en het herroepingsrecht</li>
                            <li>je toestemming, voor de nieuwsbrief (je kan je altijd uitschrijven)</li>
                            <li>een gerechtvaardigd belang, voor de beveiliging van de website en anonieme statistieken</li>
                        </ul>

                        <p className="mt-4">
                            Persoonsgegevens worden niet verkocht aan derden.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            4. Met wie kunnen gegevens worden gedeeld?
                        </h3>

                        <p>
                            Sommige gegevens kunnen worden gedeeld met partijen die noodzakelijk zijn
                            om een bestelling of de website correct te verwerken, bijvoorbeeld:
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>Mollie B.V. (Nederland), voor de online betalingen en terugbetalingen</li>
                            <li>de vervoerder die het kunstwerk levert (naam, adres en eventueel telefoonnummer)</li>
                            <li>Supabase, voor de opslag van de gegevens van de webshop</li>
                            <li>Vercel, voor de hosting van de website en de anonieme bezoekersstatistieken</li>
                            <li>Resend, voor het versturen van e-mails over je bestelling</li>
                            <li>de boekhouder, wanneer dit wettelijk nodig is</li>
                        </ul>

                        <p className="mt-4">
                            Deze partijen ontvangen alleen de gegevens die nodig zijn voor hun taak en
                            mogen ze niet voor eigen doeleinden gebruiken. Sommige van deze diensten
                            kunnen gegevens buiten de Europese Unie verwerken. In dat geval gebeurt dat
                            alleen met de waarborgen die de privacywetgeving voorschrijft, zoals het
                            EU-VS-gegevensprivacykader of de standaardcontractbepalingen van de Europese
                            Commissie.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            5. Cookies
                        </h3>

                        <p>
                            Deze website gebruikt geen marketing- of trackingcookies.
                        </p>

                        <p className="mt-4">
                            Je winkelmand, je favorieten en een lopende bestelling worden alleen in je
                            eigen browser bewaard (lokale opslag), zodat ze niet verloren gaan wanneer je
                            de pagina sluit. Die gegevens worden niet naar derden gestuurd. Daarnaast
                            gebruikt het beheergedeelte een noodzakelijke cookie om ingelogd te blijven.
                        </p>

                        <p className="mt-4">
                            De bezoekersstatistieken worden zonder cookies en anoniem verzameld. Omdat
                            alleen strikt noodzakelijke opslag gebruikt wordt, is hiervoor geen
                            toestemming nodig. Je kan deze gegevens altijd verwijderen via de
                            instellingen van je browser.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            6. Hoe lang worden gegevens bewaard?
                        </h3>

                        <p>
                            Persoonsgegevens worden niet langer bewaard dan nodig is voor het doel
                            waarvoor ze werden verzameld.
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>
                                bestellingen, facturen, creditnota&apos;s en gegevens over herroepingen en
                                terugbetalingen: 10 jaar, omdat de boekhoudwetgeving dat verplicht
                            </li>
                            <li>
                                bestellingen die nooit betaald werden: 12 maanden, daarna worden ze
                                automatisch verwijderd
                            </li>
                            <li>nieuwsbrief: tot je je uitschrijft</li>
                            <li>
                                contactaanvragen: tot je vraag beantwoord is en er geen opvolging meer
                                nodig is
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            7. Jouw rechten
                        </h3>

                        <p>
                            Je hebt binnen de grenzen van de privacywetgeving onder andere het recht om:
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>je persoonsgegevens in te kijken</li>
                            <li>onjuiste gegevens te laten verbeteren</li>
                            <li>in bepaalde gevallen gegevens te laten verwijderen</li>
                            <li>bezwaar te maken tegen bepaalde verwerkingen</li>
                            <li>de verwerking in bepaalde gevallen te laten beperken</li>
                            <li>je gegevens in een gangbaar formaat te ontvangen (overdraagbaarheid)</li>
                            <li>je toestemming in te trekken wanneer een verwerking op toestemming gebaseerd is</li>
                        </ul>

                        <p className="mt-4">
                            Voor vragen of verzoeken kan je contact opnemen via byle.art@outlook.com.
                        </p>

                        <p className="mt-4">
                            Ben je niet tevreden over hoe met je gegevens wordt omgegaan, dan kan je een
                            klacht indienen bij de Gegevensbeschermingsautoriteit
                            (www.gegevensbeschermingsautoriteit.be).
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            8. Beveiliging
                        </h3>

                        <p>
                            Er worden redelijke technische en organisatorische maatregelen genomen om
                            persoonsgegevens te beschermen tegen verlies, misbruik of ongeoorloofde
                            toegang.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            9. Wijzigingen
                        </h3>

                        <p>
                            Dit privacybeleid kan worden aangepast wanneer de website, webshop of
                            wettelijke verplichtingen veranderen.
                        </p>

                        <p className="mt-4">
                            De meest recente versie is steeds beschikbaar op deze website.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export const OrderAndDeliveryDialog: FC<LegalDialogProps> = ({
    triggerText,
}) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {triggerText}
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[1000px] max-h-[85vh] overflow-y-auto rounded-[2rem] border-border/50 p-10">
                <DialogHeader className="mb-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                        Info
                    </p>

                    <DialogTitle className="text-4xl font-light text-oker">
                        Bestellen & levering
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-8 text-muted-foreground leading-relaxed">
                    <div>
                        <p>
                            Een kunstwerk kiezen is iets persoonlijks. Daarom vind ik het belangrijk
                            dat je vooraf duidelijk weet hoe bestellen, betalen, verzenden en eventueel
                            retourneren verloopt.
                        </p>

                        <p className="mt-4">
                            De werken die je in de webshop vindt, zijn originele kunstwerken van
                            Art by Lé. Elk werk is met de hand gemaakt en uniek.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            Bestellen via de webshop
                        </h3>

                        <p>
                            Wanneer een kunstwerk beschikbaar is, kan je het rechtstreeks via de
                            webshop bestellen.
                        </p>

                        <p className="mt-4">
                            Na je bestelling ontvang je een bevestiging met de gegevens van je aankoop.
                            Zodra de betaling ontvangen is, maak ik het kunstwerk zorgvuldig klaar voor
                            verzending of afhaling.
                        </p>

                        <p className="mt-4">
                            Omdat ieder kunstwerk uniek is, is er van een origineel werk maar één
                            exemplaar beschikbaar.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            Betaling
                        </h3>

                        <p>
                            De volledige betaling gebeurt bij de bestelling, veilig via Mollie. Je kan
                            onder andere betalen met Bancontact, een kredietkaart of Apple Pay.
                        </p>

                        <p className="mt-4">
                            Alle prijzen worden duidelijk bij het kunstwerk vermeld. De verzendkosten
                            hangen af van het land en van het formaat van het werk. Bij meerdere werken
                            betaal je één keer verzending, aan het tarief van het grootste werk. Je ziet
                            het totaalbedrag altijd vóór je je bestelling bevestigt.
                        </p>

                        <p className="mt-4">
                            Art by Lé valt onder de bijzondere vrijstellingsregeling voor kleine
                            ondernemingen; er wordt geen btw aangerekend.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            Verpakking & verzending
                        </h3>

                        <p>
                            Elk kunstwerk wordt met veel zorg verpakt om het zo goed mogelijk te
                            beschermen tijdens het transport. Je kunstwerk wordt binnen 5 werkdagen na
                            betaling verzonden.
                        </p>

                        <p className="mt-4">
                            Verzenden kan naar de landen die je bij het afrekenen kan kiezen. Woon je
                            elders? Neem dan contact op voor een persoonlijke berekening.
                        </p>

                        <p className="mt-4">
                            Wanneer ik de verzending regel, blijft het kunstwerk mijn
                            verantwoordelijkheid totdat het bij jou is afgeleverd.
                        </p>

                        <p className="mt-4">
                            Na verzending ontvang je, wanneer beschikbaar, de gegevens waarmee je het
                            pakket kan volgen.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            Beschadiging tijdens transport
                        </h3>

                        <p>
                            Hoewel ieder werk zorgvuldig wordt verpakt, kan er uitzonderlijk toch iets
                            gebeuren tijdens het vervoer.
                        </p>

                        <p className="mt-4">
                            Komt je kunstwerk beschadigd aan? Neem dan zo snel mogelijk contact met mij
                            op en maak duidelijke foto&apos;s van:
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>het kunstwerk</li>
                            <li>de beschadiging</li>
                            <li>de binnenverpakking</li>
                            <li>de buitenkant van het pakket</li>
                        </ul>

                        <p className="mt-4">
                            Gooi de verpakking voorlopig niet weg. Aan de hand van de foto&apos;s bekijken
                            we samen wat er gebeurd is en zoeken we naar een passende oplossing.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            Retour & bedenktijd
                        </h3>

                        <p>
                            Voor online aankopen van bestaande kunstwerken geldt de wettelijke
                            bedenktijd van 14 kalenderdagen, te rekenen vanaf de dag nadat je het
                            werk hebt ontvangen. Je hoeft geen reden op te geven.
                        </p>

                        <p className="mt-4">
                            Bedenk je je nog vóór je werk verzonden of afgehaald is? Dan annuleer je je
                            bestelling kosteloos via de pagina van je bestelling (de link staat in je
                            bevestigingsmail). Je krijgt het volledige bedrag meteen terug.
                        </p>

                        <p className="mt-4">
                            Na verzending herroepen kan op twee manieren:
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>
                                online via{" "}
                                <Link href="/herroepen" className="underline hover:text-foreground transition-colors">
                                    Bestelling herroepen
                                </Link>{" "}
                                (je krijgt meteen een bevestiging per e-mail);
                            </li>
                            <li>
                                met het{" "}
                                <Link href="/herroeping/modelformulier" className="underline hover:text-foreground transition-colors">
                                    modelformulier voor herroeping
                                </Link>{" "}
                                (ook als{" "}
                                <a href="/herroeping/modelformulier/pdf" className="underline hover:text-foreground transition-colors">
                                    PDF
                                </a>
                                ), per e-mail of per post.
                            </li>
                        </ul>

                        <p className="mt-4">
                            Stuur het werk daarna binnen 14 dagen terug. De kosten voor het terugsturen
                            zijn voor rekening van de koper. Het kunstwerk moet zorgvuldig, veilig en
                            onbeschadigd worden teruggestuurd. Je krijgt het aankoopbedrag, inclusief de
                            oorspronkelijke standaard verzendkosten bij herroeping van de volledige
                            bestelling, terug binnen 14 dagen na je herroeping. Ik mag wachten met
                            terugbetalen tot ik het werk terug heb ontvangen of tot je aantoont dat je
                            het hebt teruggestuurd.
                        </p>

                        <p className="mt-4">
                            Buiten deze wettelijke bedenktijd worden kunstwerken niet geretourneerd of
                            omgeruild.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            Kunstwerken op maat
                        </h3>

                        <p>
                            Voor kunstwerken die speciaal volgens jouw wensen worden gemaakt of
                            duidelijk gepersonaliseerd zijn, gelden andere afspraken.
                        </p>

                        <p className="mt-4">
                            De prijzen, aanbetaling, werkwijze en voorwaarden hiervoor vind je onder{" "}
                            <Link href="/maatwerk" className="underline hover:text-foreground transition-colors">
                                Kunstwerk op maat
                            </Link>{" "}
                            in het menu bovenaan.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            Afhalen
                        </h3>

                        <p>
                            Wil je je kunstwerk liever persoonlijk afhalen? Wanneer deze mogelijkheid
                            bij de bestelling wordt aangeboden, spreken we samen een geschikt moment af
                            zodra het werk klaarstaat.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            Certificaat van echtheid
                        </h3>

                        <p>
                            Bij een origineel kunstwerk ontvang je een Certificaat van Echtheid van
                            Art by Lé.
                        </p>

                        <p className="mt-4">
                            Zo hoort niet alleen het kunstwerk zelf, maar ook zijn verhaal en
                            authenticiteit bij jou thuis.
                        </p>
                    </div>

                    <p className="italic">
                        Elk kunstwerk wordt met tijd, zorg en aandacht gemaakt, verpakt en verzonden.
                        Ik wil dat het niet alleen mooi bij je aankomt, maar dat ook het hele traject
                        ernaartoe goed voelt.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export const TermsOfServiceDialog: FC<LegalDialogProps> = ({
    triggerText,
}) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {triggerText}
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[1000px] max-h-[85vh] overflow-y-auto rounded-[2rem] border-border/50 p-10">       
             <DialogHeader className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                    Legal
                </p>

                <DialogTitle className="text-4xl font-light text-oker">
                    Terms of Service
                </DialogTitle>

                <p className="text-muted-foreground pt-2">
                    Laatst bijgewerkt: {TERMS_LAST_UPDATED}
                </p>
            </DialogHeader>

                <TermsOfServiceContent />
            </DialogContent>
        </Dialog>
    )
}

// Shared by the dialog and the /voorwaarden page (linked from order e-mails)
export const TermsOfServiceContent: FC = () => {
    return (
        <div className="space-y-8 text-muted-foreground leading-relaxed">
            <p>{TERMS_INTRO}</p>

            {TERMS_SECTIONS.map((section) => (
                <div key={section.title}>
                    <h3 className="text-xl text-foreground font-medium mb-3">
                        {section.title}
                    </h3>

                    {section.blocks.map((block, index) =>
                        block.kind === "box" ? (
                            <div key={index} className="mt-4 p-4 rounded-2xl bg-muted/40 border border-border/40">
                                {block.lines.map((line) => (
                                    <p key={line}>{line}</p>
                                ))}
                            </div>
                        ) : (
                            <p key={index} className={index > 0 ? "mt-4" : undefined}>
                                {block.content.map((part, partIndex) =>
                                    typeof part === "string" ? (
                                        part
                                    ) : (
                                        <Link
                                            key={partIndex}
                                            href={part.href}
                                            className="underline hover:text-foreground transition-colors"
                                        >
                                            {part.text}
                                        </Link>
                                    )
                                )}
                            </p>
                        )
                    )}
                </div>
            ))}
        </div>
    )
}
