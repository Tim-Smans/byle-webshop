// The terms of service (algemene voorwaarden) as data: the single source for
// the dialog, the /voorwaarden page and the PDF sent with the order
// confirmation. Change the text here and bump TERMS_VERSION /
// TERMS_LAST_UPDATED in lib/shop/config.ts.

export type TermsInline = string | { text: string; href: string }

export type TermsBlock =
  | { kind: "p"; content: TermsInline[] }
  | { kind: "box"; lines: string[] }

export interface TermsSection {
  title: string
  blocks: TermsBlock[]
}

const p = (...content: TermsInline[]): TermsBlock => ({ kind: "p", content })

export const TERMS_INTRO =
  "Welkom bij Art by Lé. Deze voorwaarden zijn van toepassing op het gebruik van deze website en op aankopen die rechtstreeks via de webshop van Art by Lé worden gedaan."

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: "1. Art by Lé",
    blocks: [
      p("Deze website en webshop behoren tot Art by Lé."),
      {
        kind: "box",
        lines: [
          "Art by Lé",
          "Hei-Ende 102",
          "2340 Vlimmeren (Beerse)",
          "België",
          "E-mail: byle.art@outlook.com",
          "Telefoon: +32 491 364 332",
          "Ondernemingsnummer: 1043.462.454",
          "Btw-nummer: BE 1043.462.454",
        ],
      },
      p("Voor vragen over een kunstwerk, bestelling of deze voorwaarden kan je contact opnemen via bovenstaande gegevens."),
      p("De website wordt technisch onderhouden door Tim Smans."),
    ],
  },
  {
    title: "2. Gebruik van de website",
    blocks: [
      p("Deze website dient voor de presentatie en verkoop van originele, handgemaakte schilderijen, mixed-media kunstwerken en sculpturen van Art by Lé."),
      p("De website mag uitsluitend op een wettelijke en respectvolle manier worden gebruikt."),
    ],
  },
  {
    title: "3. Intellectuele eigendom",
    blocks: [
      p("Alle foto's, teksten, ontwerpen, kunstwerken en andere creatieve inhoud op deze website zijn eigendom van Art by Lé, tenzij anders vermeld."),
      p("Het is niet toegestaan om foto's, teksten of ontwerpen zonder voorafgaande toestemming te kopiëren, verspreiden, reproduceren, publiceren of commercieel te gebruiken."),
      p("De aankoop van een kunstwerk houdt geen overdracht in van auteursrechten of reproductierechten."),
    ],
  },
  {
    title: "4. Productinformatie",
    blocks: [
      p("Elk kunstwerk wordt zo duidelijk en waarheidsgetrouw mogelijk beschreven en afgebeeld."),
      p("Omdat het om handgemaakte kunst gaat, kunnen structuren, details en materialen kleine natuurlijke onregelmatigheden bevatten."),
      p("Kleuren kunnen daarnaast licht verschillen naargelang de instellingen en weergave van het gebruikte scherm."),
      p("Deze verschillen maken deel uit van het handgemaakte karakter van het werk en betekenen niet automatisch dat het kunstwerk gebrekkig is."),
    ],
  },
  {
    title: "5. Prijzen",
    blocks: [
      p("De actuele verkoopprijs wordt bij ieder kunstwerk vermeld."),
      p("Eventuele bijkomende kosten, zoals verzendkosten, worden vóór het afronden van de bestelling duidelijk meegedeeld. Het totaalbedrag dat je ziet vóór je bestelt, is het bedrag dat je betaalt."),
      p("Art by Lé valt onder de bijzondere vrijstellingsregeling voor kleine ondernemingen. Er wordt daarom geen btw aangerekend en op de factuur vermeld."),
      p("Prijzen en beschikbare werken kunnen worden aangepast zolang er nog geen bestelling tot stand is gekomen."),
    ],
  },
  {
    title: "6. Beschikbaarheid",
    blocks: [
      p("De meeste kunstwerken van Art by Lé zijn unieke werken waarvan slechts één exemplaar bestaat."),
      p("Een kunstwerk is daarom slechts beschikbaar zolang het niet verkocht is."),
      p("Mocht uitzonderlijk blijken dat een besteld werk toch niet meer beschikbaar is, dan wordt de koper hiervan zo snel mogelijk op de hoogte gebracht en wordt een reeds ontvangen betaling terugbetaald."),
    ],
  },
  {
    title: "7. Bestellen en betalen",
    blocks: [
      p("Je bestelt door de gewenste werken in je winkelmand te leggen, je gegevens en de leveringswijze in te vullen, deze voorwaarden te aanvaarden en op \"Bestellen en betalen\" te klikken. Daarna betaal je via Mollie."),
      p("Vanaf het moment dat je op \"Bestellen en betalen\" klikt, blijven de werken 30 minuten voor jou gereserveerd. De overeenkomst komt tot stand zodra je betaling is ontvangen. Lukt de betaling niet, dan vervalt de reservatie en wordt er niets aangerekend."),
      p("Na je betaling ontvang je een bevestiging per e-mail met alle gegevens van je bestelling, de factuur, deze voorwaarden en het modelformulier voor herroeping."),
      p("Meer praktische informatie over betaling, verpakking, verzending, afhaling en levering staat op de pagina Bestellen & levering."),
    ],
  },
  {
    title: "8. Verzending en levering",
    blocks: [
      p("Kunstwerken worden zorgvuldig verpakt voor transport en binnen 5 werkdagen na betaling verzonden, of klaargezet om af te halen."),
      p("Wanneer Art by Lé de verzending regelt, blijft het kunstwerk de verantwoordelijkheid van Art by Lé totdat het bij de koper is afgeleverd."),
      p("Wanneer een pakket beschadigd aankomt, wordt gevraagd zo snel mogelijk contact op te nemen en duidelijke foto's van het kunstwerk, de beschadiging en de verpakking te bezorgen."),
    ],
  },
  {
    title: "9. Bedenktijd en retourneren",
    blocks: [
      p("Voor bestaande kunstwerken die je als consument online via de webshop koopt, heb je het recht om de aankoop zonder opgave van redenen te herroepen binnen 14 kalenderdagen, te rekenen vanaf de dag nadat je het werk hebt ontvangen."),
      p(
        "Herroepen kan online via ",
        { text: "Bestelling herroepen", href: "/herroepen" },
        " of met het ",
        { text: "modelformulier voor herroeping", href: "/herroeping/modelformulier" },
        ". Je ontvangt een bevestiging van je herroeping per e-mail."
      ),
      p("Je stuurt het werk binnen 14 dagen na je herroeping zorgvuldig verpakt terug. De kosten van het terugsturen zijn voor jouw rekening. Art by Lé betaalt het aankoopbedrag terug binnen 14 dagen na de herroeping, inclusief de oorspronkelijke standaard verzendkosten wanneer de volledige bestelling herroepen wordt, met hetzelfde betaalmiddel. De terugbetaling mag worden uitgesteld tot het werk is ontvangen of tot je hebt aangetoond dat je het hebt teruggestuurd."),
      p("Meer praktische informatie staat onder Bestellen & levering."),
      p("Buiten de wettelijke bedenktijd worden geen vrijwillige retouren of omruilingen aangeboden."),
    ],
  },
  {
    title: "10. Kunstwerk op maat",
    blocks: [
      p("Voor kunstwerken die speciaal volgens persoonlijke wensen of specificaties worden gemaakt, gelden afzonderlijke voorwaarden."),
      p("Voor een opdracht wordt vooraf een richtprijs besproken en wordt een aanbetaling van 25% gevraagd."),
      p("De resterende 75% wordt betaald wanneer het kunstwerk klaar is en vóór verzending of afhaling."),
      p("Een kunstwerk op maat wordt speciaal volgens de wensen van de opdrachtgever gemaakt. Daarom geldt hiervoor niet de gebruikelijke bedenktijd voor online aankopen wanneer het werk onder de wettelijke uitzondering voor maatwerk valt."),
      p(
        "Alle informatie over prijzen, werkwijze, levertijd en voorwaarden staat op de pagina ",
        { text: "Kunstwerk op maat", href: "/maatwerk" },
        "."
      ),
    ],
  },
  {
    title: "11. Wettelijke rechten en garantie",
    blocks: [
      p("Art by Lé staat ervoor in dat een geleverd kunstwerk overeenkomt met wat werd besteld en beschikt over de eigenschappen die redelijkerwijs van het kunstwerk mogen worden verwacht."),
      p("Wanneer een kunstwerk beschadigd, verkeerd of niet volgens de overeenkomst wordt geleverd, blijven de wettelijke rechten van de consument van toepassing."),
      p("De wettelijke conformiteitsgarantie van 2 jaar voor consumptiegoederen is van toepassing."),
      p("Het handgemaakte karakter, zichtbare textuur en kleine natuurlijke verschillen die eigen zijn aan de gebruikte materialen worden daarbij niet automatisch als een gebrek beschouwd."),
    ],
  },
  {
    title: "12. Klachten",
    blocks: [
      p("Heb je een klacht over een bestelling? Neem dan eerst contact op via byle.art@outlook.com. Ik antwoord zo snel mogelijk en zoek samen met jou naar een oplossing."),
      p("Komen we er samen niet uit, dan kan je als consument terecht bij de Consumentenombudsdienst (www.consumentenombudsdienst.be), die je klacht gratis kan behandelen of doorsturen naar de bevoegde instantie."),
    ],
  },
  {
    title: "13. Externe links",
    blocks: [
      p("Deze website kan links bevatten naar websites of diensten van derden."),
      p("Art by Lé is niet verantwoordelijk voor de inhoud, beschikbaarheid of privacypraktijken van externe websites."),
    ],
  },
  {
    title: "14. Aansprakelijkheid",
    blocks: [
      p("Art by Lé doet haar best om de informatie op deze website correct en actueel te houden."),
      p("Kennelijke fouten of vergissingen in teksten, prijzen of technische informatie kunnen worden gecorrigeerd."),
      p("Niets in deze voorwaarden beperkt de wettelijke rechten van consumenten of aansprakelijkheid die volgens de toepasselijke wetgeving niet kan worden uitgesloten."),
    ],
  },
  {
    title: "15. Privacy",
    blocks: [
      p("Voor informatie over de verwerking en bescherming van persoonsgegevens kan je het Privacy Policy van Art by Lé raadplegen."),
    ],
  },
  {
    title: "16. Wijzigingen",
    blocks: [
      p("Deze voorwaarden kunnen worden aangepast wanneer de website, webshop, werkwijze of toepasselijke regelgeving verandert."),
      p("De meest recente versie is steeds beschikbaar op deze website."),
    ],
  },
]
