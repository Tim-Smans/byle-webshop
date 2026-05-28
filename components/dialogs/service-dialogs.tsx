"use client"

import { FC } from "react"
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
                        Laatst bijgewerkt: 26 mei 2026
                    </p>
                </DialogHeader>

                <div className="space-y-8 text-muted-foreground leading-relaxed">
                    <p>
                        Welkom op deze website. Jouw privacy is belangrijk.
                        In dit privacybeleid leg ik uit welke gegevens eventueel verzameld
                        worden wanneer je deze website bezoekt.
                    </p>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            1. Wie beheert deze website?
                        </h3>

                        <p>
                            Deze website wordt beheerd door Tim Smans.
                        </p>

                        <p className="mt-3">
                            Voor vragen over dit privacybeleid kan je contact opnemen via:
                        </p>

                        <div className="mt-4 p-4 rounded-2xl bg-muted/40 border border-border/40">
                            <p>E-mail: tim.smans@outlook.com</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            2. Welke gegevens worden verzameld?
                        </h3>

                        <p>
                            Deze website verkoopt geen producten rechtstreeks.
                        </p>

                        <p className="mt-4">
                            Wanneer je contact opneemt via e-mail of een contactformulier,
                            kunnen volgende gegevens verwerkt worden:
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>naam</li>
                            <li>e-mailadres</li>
                            <li>eventuele informatie die je zelf doorstuurt</li>
                        </ul>

                        <p className="mt-4">
                            Daarnaast kunnen technische gegevens automatisch verzameld worden
                            via cookies of statistieken, zoals:
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>IP-adres</li>
                            <li>browsertype</li>
                            <li>bezochte pagina’s</li>
                            <li>duur van het bezoek</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            3. Waarvoor worden deze gegevens gebruikt?
                        </h3>

                        <p>
                            Gegevens worden enkel gebruikt om:
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>berichten te beantwoorden</li>
                            <li>de website goed te laten functioneren</li>
                            <li>bezoekersstatistieken te bekijken</li>
                            <li>de gebruikerservaring te verbeteren</li>
                        </ul>

                        <p className="mt-4">
                            Persoonlijke gegevens worden nooit verkocht aan derden.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            4. Etsy-doorverwijzingen
                        </h3>

                        <p>
                            Deze website bevat links naar mijn Etsy-shop.
                            Wanneer je op een Etsy-link klikt, verlaat je deze website en geldt
                            het privacybeleid van Etsy.
                        </p>

                        <p className="mt-4">
                            Aankopen, betalingen en verwerking van persoonsgegevens gebeuren
                            volledig via Etsy.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            5. Cookies
                        </h3>

                        <p>
                            Deze website kan cookies gebruiken om goed te functioneren en om
                            bezoekersstatistieken te verzamelen.
                        </p>

                        <p className="mt-4">
                            Je kan cookies uitschakelen via de instellingen van je browser.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            6. Bewaren van gegevens
                        </h3>

                        <p>
                            Persoonlijke gegevens worden niet langer bewaard dan nodig is om
                            vragen of berichten te beantwoorden.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            7. Jouw rechten
                        </h3>

                        <p>
                            Je hebt het recht om:
                        </p>

                        <ul className="mt-4 space-y-2 list-disc pl-6">
                            <li>je persoonsgegevens in te kijken</li>
                            <li>gegevens te laten aanpassen</li>
                            <li>gegevens te laten verwijderen</li>
                        </ul>

                        <p className="mt-4">
                            Hiervoor kan je contact opnemen via het hierboven vermelde
                            e-mailadres.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            8. Wijzigingen
                        </h3>

                        <p>
                            Dit privacybeleid kan aangepast worden wanneer nodig.
                            De meest recente versie staat altijd op deze website.
                        </p>
                    </div>
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
                    Laatst bijgewerkt: 26 mei 2026
                </p>
            </DialogHeader>

                <div className="space-y-8 text-muted-foreground leading-relaxed">
                    <p>
                        Welkom op deze website. Door deze website te bezoeken,
                        ga je akkoord met onderstaande voorwaarden.
                    </p>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            1. Gebruik van de website
                        </h3>

                        <p>
                            Deze website dient ter inspiratie en presentatie van handgemaakte
                            creaties en kunstwerken.
                        </p>

                        <p className="mt-4">
                            Bezoekers mogen de website gebruiken op een respectvolle en
                            wettelijke manier.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            2. Intellectuele eigendom
                        </h3>

                        <p>
                            Alle foto’s, teksten en creatieve inhoud op deze website zijn
                            eigendom van Art by Lé, tenzij anders vermeld.
                        </p>

                        <p className="mt-4">
                            Het is niet toegestaan om inhoud te kopiëren, verspreiden of
                            commercieel te gebruiken zonder toestemming.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            3. Productinformatie
                        </h3>

                        <p>
                            De creaties en informatie op deze website worden met zorg
                            weergegeven.
                        </p>

                        <p className="mt-4">
                            Kleuren en details kunnen licht verschillen afhankelijk van
                            scherminstellingen of handgemaakt karakter.
                        </p>

                        <p className="mt-4">
                            Beschikbaarheid, prijzen en collecties kunnen op elk moment
                            aangepast worden.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            4. Verkoop via Etsy
                        </h3>

                        <p>
                            Deze website verkoopt geen producten rechtstreeks.
                        </p>

                        <p className="mt-4">
                            Voor aankopen word je doorgestuurd naar mijn Etsy-shop via Etsy.
                        </p>

                        <p className="mt-4">
                            Alle betalingen, verzendingen, retouren en transacties verlopen
                            via Etsy en vallen onder hun voorwaarden en beleid.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            5. Externe links
                        </h3>

                        <p>
                            Deze website kan links bevatten naar externe websites.
                        </p>

                        <p className="mt-4">
                            Ik ben niet verantwoordelijk voor de inhoud, werking of
                            privacypraktijken van deze externe websites.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            6. Aansprakelijkheid
                        </h3>

                        <p>
                            Ik doe mijn best om correcte en actuele informatie te tonen,
                            maar kan niet garanderen dat alle informatie altijd volledig
                            foutloos is.
                        </p>

                        <p className="mt-4">
                            Gebruik van deze website gebeurt op eigen verantwoordelijkheid.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl text-foreground font-medium mb-3">
                            7. Wijzigingen
                        </h3>

                        <p>
                            Deze voorwaarden kunnen aangepast worden wanneer nodig.
                            De meest recente versie staat altijd op deze website.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}