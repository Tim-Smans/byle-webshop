"use client"

import { FC } from "react"
import Link from "next/link"
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
                        Laatst bijgewerkt: 3 oktober 2026
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
                            <p>E-mail: byle.art@outlook.com</p>
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
                            <li>gegevens over je bestelling</li>
                            <li>informatie die je zelf doorgeeft via e-mail of een contactformulier</li>
                            <li>gegevens die nodig zijn voor betaling en levering</li>
                        </ul>

                        <p className="mt-4">
                            Betalingsgegevens kunnen worden verwerkt via de betaalprovider die voor
                            de webshop wordt gebruikt.
                        </p>

                        <p className="mt-4">
                            Daarnaast kunnen automatisch technische gegevens worden verzameld, zoals:
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>IP-adres</li>
                            <li>browsertype</li>
                            <li>bezochte pagina’s</li>
                            <li>duur van het bezoek</li>
                            <li>noodzakelijke cookies en, indien toegestaan, statistische cookies</li>
                        </ul>
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
                            <li>de website veilig en goed laten functioneren</li>
                            <li>bezoekersstatistieken bekijken, indien hiervoor toestemming is gegeven</li>
                        </ul>

                        <p className="mt-4">
                            Gegevens die nodig zijn om een bestelling uit te voeren, worden verwerkt
                            voor de uitvoering van die bestelling.
                        </p>

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
                            <li>de betaalprovider</li>
                            <li>de vervoerder die het kunstwerk levert</li>
                            <li>de hosting- of webshopprovider</li>
                            <li>boekhoudkundige of administratieve dienstverleners wanneer dit wettelijk nodig is</li>
                        </ul>

                        <p className="mt-4">
                            Deze partijen ontvangen alleen de gegevens die nodig zijn voor hun taak.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            5. Etsy
                        </h3>

                        <p>
                            Deze website kan nog links bevatten naar mijn Etsy-shop.
                        </p>

                        <p className="mt-4">
                            Wanneer je een Etsy-link gebruikt en een aankoop via Etsy doet, gelden
                            voor die aankoop de privacyvoorwaarden en voorwaarden van Etsy.
                        </p>

                        <p className="mt-4">
                            Aankopen die rechtstreeks via de webshop van Art by Lé gebeuren, worden
                            door Art by Lé verwerkt.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            6. Cookies
                        </h3>

                        <p>
                            Deze website gebruikt cookies die noodzakelijk kunnen zijn voor de goede
                            werking van de website en webshop, bijvoorbeeld voor het winkelmandje of
                            beveiliging.
                        </p>

                        <p className="mt-4">
                            Voor niet-noodzakelijke cookies, zoals bepaalde statistische of
                            marketingcookies, wordt vooraf toestemming gevraagd via de
                            cookie-instellingen.
                        </p>

                        <p className="mt-4">
                            Strikt noodzakelijke cookies kunnen zonder voorafgaande toestemming worden
                            gebruikt. Voor andere cookies wordt, waar nodig, toestemming gevraagd.
                        </p>

                        <p className="mt-4">
                            Je kan je cookievoorkeuren aanpassen via de cookie-instellingen van de
                            website en cookies ook verwijderen via je browser.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            7. Hoe lang worden gegevens bewaard?
                        </h3>

                        <p>
                            Persoonsgegevens worden niet langer bewaard dan nodig is voor het doel
                            waarvoor ze werden verzameld.
                        </p>

                        <p className="mt-4">
                            Gegevens die deel uitmaken van bestellingen, facturen of de boekhouding
                            worden bewaard zolang dit wettelijk verplicht is. Voor bepaalde
                            boekhoudkundige documenten geldt een wettelijke bewaartermijn van 10 jaar.
                        </p>

                        <p className="mt-4">
                            Andere gegevens, bijvoorbeeld uit een gewone contactaanvraag, worden
                            verwijderd zodra ze niet meer nodig zijn.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            8. Jouw rechten
                        </h3>

                        <p>
                            Je hebt binnen de grenzen van de privacywetgeving onder andere het recht om:
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>je persoonsgegevens in te kijken</li>
                            <li>onjuiste gegevens te laten verbeteren</li>
                            <li>in bepaalde gevallen gegevens te laten verwijderen</li>
                            <li>bezwaar te maken tegen bepaalde verwerkingen</li>
                            <li>je toestemming in te trekken wanneer een verwerking op toestemming gebaseerd is</li>
                        </ul>

                        <p className="mt-4">
                            Voor vragen of verzoeken kan je contact opnemen via byle.art@outlook.com.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            9. Beveiliging
                        </h3>

                        <p>
                            Er worden redelijke technische en organisatorische maatregelen genomen om
                            persoonsgegevens te beschermen tegen verlies, misbruik of ongeoorloofde
                            toegang.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            10. Wijzigingen
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
                            De volledige betaling gebeurt bij de bestelling via de betaalmogelijkheden
                            die in de webshop worden aangeboden.
                        </p>

                        <p className="mt-4">
                            Alle prijzen worden duidelijk bij het kunstwerk vermeld. Eventuele
                            verzendkosten worden vóór het afronden van je bestelling weergegeven, zodat
                            je vooraf weet wat het totaalbedrag is.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            Verpakking & verzending
                        </h3>

                        <p>
                            Elk kunstwerk wordt met veel zorg verpakt om het zo goed mogelijk te
                            beschermen tijdens het transport.
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
                            bedenktijd van 14 dagen vanaf de dag van ontvangst.
                        </p>

                        <p className="mt-4">
                            Wil je hiervan gebruikmaken, neem dan binnen deze termijn contact met mij
                            op. De kosten voor het terugsturen zijn voor rekening van de koper. Het
                            kunstwerk moet zorgvuldig, veilig en onbeschadigd worden teruggestuurd.
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
                    Laatst bijgewerkt: 3 oktober 2026
                </p>
            </DialogHeader>

                <div className="space-y-8 text-muted-foreground leading-relaxed">
                    <p>
                        Welkom bij Art by Lé. Deze voorwaarden zijn van toepassing op het gebruik
                        van deze website en op aankopen die rechtstreeks via de webshop van
                        Art by Lé worden gedaan.
                    </p>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            1. Art by Lé
                        </h3>

                        <p>
                            Deze website en webshop behoren tot Art by Lé.
                        </p>

                        <div className="mt-4 p-4 rounded-2xl bg-muted/40 border border-border/40">
                            <p>Art by Lé</p>
                            <p>Hei-Ende 102</p>
                            <p>2340 Vlimmeren (Beerse)</p>
                            <p>België</p>
                            <p className="mt-3">E-mail: byle.art@outlook.com</p>
                            <p>Telefoon: +32 491 364 332</p>
                            <p>Ondernemingsnummer: 1043.462.454</p>
                            <p>Btw-nummer: BE 1043.462.454</p>
                        </div>

                        <p className="mt-4">
                            Voor vragen over een kunstwerk, bestelling of deze voorwaarden kan je
                            contact opnemen via bovenstaande gegevens.
                        </p>

                        <p className="mt-4">
                            De website wordt technisch onderhouden door Tim Smans.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            2. Gebruik van de website
                        </h3>

                        <p>
                            Deze website dient voor de presentatie en verkoop van originele,
                            handgemaakte schilderijen, mixed-media kunstwerken en sculpturen van
                            Art by Lé.
                        </p>

                        <p className="mt-4">
                            De website mag uitsluitend op een wettelijke en respectvolle manier
                            worden gebruikt.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            3. Intellectuele eigendom
                        </h3>

                        <p>
                            Alle foto&apos;s, teksten, ontwerpen, kunstwerken en andere creatieve
                            inhoud op deze website zijn eigendom van Art by Lé, tenzij anders vermeld.
                        </p>

                        <p className="mt-4">
                            Het is niet toegestaan om foto&apos;s, teksten of ontwerpen zonder
                            voorafgaande toestemming te kopiëren, verspreiden, reproduceren,
                            publiceren of commercieel te gebruiken.
                        </p>

                        <p className="mt-4">
                            De aankoop van een kunstwerk houdt geen overdracht in van auteursrechten
                            of reproductierechten.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            4. Productinformatie
                        </h3>

                        <p>
                            Elk kunstwerk wordt zo duidelijk en waarheidsgetrouw mogelijk beschreven
                            en afgebeeld.
                        </p>

                        <p className="mt-4">
                            Omdat het om handgemaakte kunst gaat, kunnen structuren, details en
                            materialen kleine natuurlijke onregelmatigheden bevatten.
                        </p>

                        <p className="mt-4">
                            Kleuren kunnen daarnaast licht verschillen naargelang de instellingen en
                            weergave van het gebruikte scherm.
                        </p>

                        <p className="mt-4">
                            Deze verschillen maken deel uit van het handgemaakte karakter van het werk
                            en betekenen niet automatisch dat het kunstwerk gebrekkig is.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            5. Prijzen
                        </h3>

                        <p>
                            De actuele verkoopprijs wordt bij ieder kunstwerk vermeld.
                        </p>

                        <p className="mt-4">
                            Eventuele bijkomende kosten, zoals verzendkosten, worden vóór het afronden
                            van de bestelling duidelijk meegedeeld.
                        </p>

                        <p className="mt-4">
                            Prijzen en beschikbare werken kunnen worden aangepast zolang er nog geen
                            bestelling tot stand is gekomen.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            6. Beschikbaarheid
                        </h3>

                        <p>
                            De meeste kunstwerken van Art by Lé zijn unieke werken waarvan slechts
                            één exemplaar bestaat.
                        </p>

                        <p className="mt-4">
                            Een kunstwerk is daarom slechts beschikbaar zolang het niet verkocht is.
                        </p>

                        <p className="mt-4">
                            Mocht uitzonderlijk blijken dat een besteld werk toch niet meer
                            beschikbaar is, dan wordt de koper hiervan zo snel mogelijk op de hoogte
                            gebracht en wordt een reeds ontvangen betaling terugbetaald.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            7. Bestellen en betalen
                        </h3>

                        <p>
                            Bestellingen kunnen rechtstreeks via de webshop worden geplaatst via de
                            aangeboden betaalmogelijkheden.
                        </p>

                        <p className="mt-4">
                            Na het plaatsen van de bestelling ontvangt de koper een bevestiging.
                        </p>

                        <p className="mt-4">
                            Meer praktische informatie over betaling, verpakking, verzending, afhaling
                            en levering staat op de pagina Bestellen &amp; levering.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            8. Verzending en levering
                        </h3>

                        <p>
                            Kunstwerken worden zorgvuldig verpakt voor transport.
                        </p>

                        <p className="mt-4">
                            Wanneer Art by Lé de verzending regelt, blijft het kunstwerk de
                            verantwoordelijkheid van Art by Lé totdat het bij de koper is afgeleverd.
                        </p>

                        <p className="mt-4">
                            Wanneer een pakket beschadigd aankomt, wordt gevraagd zo snel mogelijk
                            contact op te nemen en duidelijke foto&apos;s van het kunstwerk, de
                            beschadiging en de verpakking te bezorgen.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            9. Bedenktijd en retourneren
                        </h3>

                        <p>
                            Voor bestaande kunstwerken die als consument online via de webshop worden
                            gekocht, geldt het wettelijke herroepingsrecht wanneer dit volgens de
                            toepasselijke wetgeving van toepassing is.
                        </p>

                        <p className="mt-4">
                            De praktische voorwaarden en informatie hierover staan vermeld onder
                            Bestellen &amp; levering.
                        </p>

                        <p className="mt-4">
                            Buiten de wettelijke bedenktijd worden geen vrijwillige retouren of
                            omruilingen aangeboden.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            10. Kunstwerk op maat
                        </h3>

                        <p>
                            Voor kunstwerken die speciaal volgens persoonlijke wensen of specificaties
                            worden gemaakt, gelden afzonderlijke voorwaarden.
                        </p>

                        <p className="mt-4">
                            Voor een opdracht wordt vooraf een richtprijs besproken en wordt een
                            aanbetaling van 25% gevraagd.
                        </p>

                        <p className="mt-4">
                            De resterende 75% wordt betaald wanneer het kunstwerk klaar is en vóór
                            verzending of afhaling.
                        </p>

                        <p className="mt-4">
                            Een kunstwerk op maat wordt speciaal volgens de wensen van de opdrachtgever
                            gemaakt. Daarom geldt hiervoor niet de gebruikelijke bedenktijd voor online
                            aankopen wanneer het werk onder de wettelijke uitzondering voor maatwerk valt.
                        </p>

                        <p className="mt-4">
                            Alle informatie over prijzen, werkwijze, levertijd en voorwaarden staat op
                            de pagina{" "}
                            <Link href="/maatwerk" className="underline hover:text-foreground transition-colors">
                                Kunstwerk op maat
                            </Link>
                            .
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            11. Wettelijke rechten en garantie
                        </h3>

                        <p>
                            Art by Lé staat ervoor in dat een geleverd kunstwerk overeenkomt met wat
                            werd besteld en beschikt over de eigenschappen die redelijkerwijs van het
                            kunstwerk mogen worden verwacht.
                        </p>

                        <p className="mt-4">
                            Wanneer een kunstwerk beschadigd, verkeerd of niet volgens de overeenkomst
                            wordt geleverd, blijven de wettelijke rechten van de consument van
                            toepassing.
                        </p>

                        <p className="mt-4">
                            Het handgemaakte karakter, zichtbare textuur en kleine natuurlijke
                            verschillen die eigen zijn aan de gebruikte materialen worden daarbij niet
                            automatisch als een gebrek beschouwd.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            12. Etsy
                        </h3>

                        <p>
                            Deze website kan links bevatten naar de Etsy-shop van Art by Lé.
                        </p>

                        <p className="mt-4">
                            Wanneer een aankoop rechtstreeks via Etsy wordt gedaan, verloopt die
                            transactie via het Etsy-platform en zijn ook de toepasselijke voorwaarden
                            en beleidsregels van Etsy van toepassing.
                        </p>

                        <p className="mt-4">
                            Een aankoop via Etsy staat los van een bestelling die rechtstreeks via de
                            webshop van Art by Lé wordt geplaatst.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            13. Externe links
                        </h3>

                        <p>
                            Deze website kan links bevatten naar websites of diensten van derden.
                        </p>

                        <p className="mt-4">
                            Art by Lé is niet verantwoordelijk voor de inhoud, beschikbaarheid of
                            privacypraktijken van externe websites.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            14. Aansprakelijkheid
                        </h3>

                        <p>
                            Art by Lé doet haar best om de informatie op deze website correct en
                            actueel te houden.
                        </p>

                        <p className="mt-4">
                            Kennelijke fouten of vergissingen in teksten, prijzen of technische
                            informatie kunnen worden gecorrigeerd.
                        </p>

                        <p className="mt-4">
                            Niets in deze voorwaarden beperkt de wettelijke rechten van consumenten of
                            aansprakelijkheid die volgens de toepasselijke wetgeving niet kan worden
                            uitgesloten.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            15. Privacy
                        </h3>

                        <p>
                            Voor informatie over de verwerking en bescherming van persoonsgegevens kan
                            je het Privacy Policy van Art by Lé raadplegen.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            16. Wijzigingen
                        </h3>

                        <p>
                            Deze voorwaarden kunnen worden aangepast wanneer de website, webshop,
                            werkwijze of toepasselijke regelgeving verandert.
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