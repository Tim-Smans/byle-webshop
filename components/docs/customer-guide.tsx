import Link from "next/link"
import { Bullets, Flow, Note, PartHeader, Steps, SubTitle, Topic, TopicIndex, Ui } from "./docs-ui"

const TOPICS = [
    { id: "k-kopen", title: "Een kunstwerk kopen" },
    { id: "k-uniek", title: "Uniek werk en reservatie" },
    { id: "k-favorieten", title: "Favorieten" },
    { id: "k-prijzen", title: "Prijzen, verzending, betalen" },
    { id: "k-na", title: "Na je bestelling" },
    { id: "k-annuleren", title: "Annuleren" },
    { id: "k-herroepen", title: "Herroepen en retour" },
    { id: "k-schade", title: "Schade en garantie" },
    { id: "k-contact", title: "Contact en klachten" },
]

export default function CustomerGuide() {
    return (
        <div>
            <PartHeader
                id="klanten"
                eyebrow="Voor klanten"
                title="Bestellen bij Art by Lé"
                intro="Hoe je een kunstwerk koopt, wat er na je bestelling gebeurt en wat je rechten zijn."
            />
            <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6 lg:gap-12 pt-6">
                <TopicIndex label="Inhoud voor klanten" items={TOPICS} />
                <div className="min-w-0 max-w-2xl">
                    <Topic id="k-kopen" title="Een kunstwerk kopen">
                        <Steps>
                            <li>Kies een werk in de <Link href="/gallery" className="underline underline-offset-4">Galerij</Link> en open de detailpagina.</li>
                            <li>Klik op <Ui>In winkelmand</Ui>. Je winkelmand opent aan de zijkant; je vindt ze ook altijd via het tasje rechtsboven.</li>
                            <li>Klik op <Ui>Afrekenen</Ui>.</li>
                            <li>Vul je gegevens in. Bestel je als bedrijf, vink dan <Ui>Ik bestel als bedrijf</Ui> aan en vul je bedrijfsnaam en btw-nummer in.</li>
                            <li>Kies <strong>Verzenden</strong> (kies je land en vul je adres in) of <strong>Afhalen</strong> in Vlimmeren (gratis, op afspraak).</li>
                            <li>Kijk het overzicht na: werken, verzendkosten en totaalbedrag. Vink aan dat je akkoord gaat met de algemene voorwaarden.</li>
                            <li>Klik op <Ui>Bestellen en betalen</Ui> en betaal via Mollie.</li>
                            <li>Je komt terug op de pagina van je bestelling en krijgt een bevestiging per e-mail.</li>
                        </Steps>
                    </Topic>

                    <Topic id="k-uniek" title="Uniek werk en reservatie">
                        <p>Elk kunstwerk bestaat maar één keer. Daarom:</p>
                        <Bullets>
                            <li>Een werk in je winkelmand is nog <strong>niet</strong> voor jou gereserveerd. Iemand anders kan het ook in zijn winkelmand hebben.</li>
                            <li>Vanaf het moment dat je op <Ui>Bestellen en betalen</Ui> klikt, is het werk <strong>30 minuten</strong> voor jou gereserveerd. Wie het daarna probeert te kopen, ziet <em>Tijdelijk gereserveerd</em>.</li>
                            <li>Lukt je betaling niet of annuleer je ze bij Mollie, dan komt het werk weer vrij. Er wordt niets aangerekend.</li>
                            <li>Ben je weggeklikt tijdens het betalen? In je winkelmand staat dan <em>Je was dit werk aan het afrekenen</em> met de knop <Ui>Verder afrekenen</Ui>. Je eigen onafgewerkte betaling blokkeert je niet.</li>
                        </Bullets>
                    </Topic>

                    <Topic id="k-favorieten" title="Favorieten">
                        <p>Met het hartje bij een werk bewaar je het als favoriet. Je favorieten vind je via het hartje rechtsboven. Vanuit die lijst leg je een werk met één klik in je winkelmand.</p>
                        <p>Favorieten en je winkelmand worden in je eigen browser bewaard. Op een ander toestel of in een andere browser zie je ze niet.</p>
                    </Topic>

                    <Topic id="k-prijzen" title="Prijzen, verzending en betalen">
                        <Bullets>
                            <li><strong>Geen btw.</strong> Art by Lé valt onder de vrijstellingsregeling voor kleine ondernemingen. De prijs die je ziet, is wat je betaalt.</li>
                            <li><strong>Verzendkosten</strong> hangen af van het land en van het formaat van het werk (klein of groot). Bestel je meerdere werken, dan betaal je één keer verzending: het tarief van het grootste werk.</li>
                            <li><strong>Afhalen</strong> in Vlimmeren is gratis.</li>
                            <li>Staat je land niet in de lijst? <Link href="/contact" className="underline underline-offset-4">Neem contact op</Link> voor een persoonlijke berekening.</li>
                            <li><strong>Betalen</strong> gebeurt veilig via Mollie, onder andere met Bancontact, kredietkaart en Apple Pay. Art by Lé ziet je kaart- of rekeninggegevens niet.</li>
                        </Bullets>
                    </Topic>

                    <Topic id="k-na" title="Na je bestelling">
                        <SubTitle>De bevestigingsmail</SubTitle>
                        <p>Je krijgt een e-mail met alle gegevens van je bestelling en drie bijlagen:</p>
                        <Bullets>
                            <li>de <strong>factuur</strong>;</li>
                            <li>de <strong>algemene voorwaarden</strong>;</li>
                            <li>het <strong>modelformulier voor herroeping</strong>.</li>
                        </Bullets>

                        <SubTitle>Je bestelpagina</SubTitle>
                        <p>Via <Ui>Bekijk je bestelling</Ui> in de mail kom je op de pagina van je bestelling. Bewaar die mail: de link is je persoonlijke toegang, zonder account of wachtwoord. Daar zie je:</p>
                        <Bullets>
                            <li>een tijdlijn met hoe ver je bestelling staat;</li>
                            <li>je factuur om te downloaden;</li>
                            <li>de knop om te annuleren of te herroepen, als dat op dat moment kan.</li>
                        </Bullets>
                        <Flow steps={["Bestelling ontvangen", "Verzonden", "Geleverd", "Afgerond"]} />
                        <p>Bij afhalen is het: Bestelling ontvangen → Afgehaald → Afgerond. <em>Afgerond</em> betekent dat de bedenktijd van 14 dagen voorbij is.</p>

                        <SubTitle>Verzending</SubTitle>
                        <p>Je kunstwerk wordt zorgvuldig verpakt en <strong>binnen 5 werkdagen na betaling</strong> verzonden. Zodra het vertrekt, krijg je een e-mail, waar mogelijk met een link om je pakket te volgen. Kies je voor afhalen, dan neemt Lé contact op om een moment af te spreken.</p>
                        <p>Bij elk origineel werk hoort een <strong>Certificaat van Echtheid</strong>.</p>
                    </Topic>

                    <Topic id="k-annuleren" title="Annuleren">
                        <p>Bedenk je je nog vóór je werk verzonden of afgehaald is? Dan annuleer je je bestelling kosteloos.</p>
                        <Steps>
                            <li>Open je bestelpagina via de link in je bevestigingsmail, of ga naar <Link href="/herroepen" className="underline underline-offset-4">Bestelling herroepen</Link> en vul je gegevens in.</li>
                            <li>Klik op <Ui>Bestelling annuleren</Ui> en bevestig.</li>
                            <li>Je krijgt het volledige bedrag meteen terug, met hetzelfde betaalmiddel, en een bevestiging per e-mail. Afhankelijk van je bank duurt het enkele werkdagen voor het op je rekening staat.</li>
                        </Steps>
                        <Note>Is je werk al verzonden, dan kan je niet meer annuleren, maar wel herroepen.</Note>
                    </Topic>

                    <Topic id="k-herroepen" title="Herroepen en retour">
                        <p>Voor bestaande kunstwerken die je online koopt, heb je <strong>14 kalenderdagen bedenktijd</strong>, te rekenen vanaf de dag nadat je het werk hebt ontvangen. Je hoeft geen reden op te geven. Herroepen kan zodra je bestelling verzonden is, ook als ze nog onderweg is.</p>

                        <SubTitle>Zo herroep je</SubTitle>
                        <Steps>
                            <li>Ga naar <Link href="/herroepen" className="underline underline-offset-4">Bestelling herroepen</Link> (ook onderaan elke pagina), of gebruik de link in je bevestigingsmail.</li>
                            <li>Vul je naam, je e-mailadres en je bestelnummer in (dat staat in je bevestigingsmail).</li>
                            <li>Kies welke werken je herroept. Een reden opgeven is niet nodig.</li>
                            <li>Klik op <Ui>Herroeping bevestigen</Ui>. Je krijgt meteen een bevestiging met de datum en het tijdstip waarop je herroeping ontvangen werd.</li>
                        </Steps>
                        <p>Liever op papier of per e-mail? Gebruik het <Link href="/herroeping/modelformulier" className="underline underline-offset-4">modelformulier voor herroeping</Link>. Het zit ook als bijlage bij je bevestigingsmail.</p>

                        <SubTitle>Terugsturen en terugbetaling</SubTitle>
                        <Bullets>
                            <li>Stuur het werk binnen 14 dagen na je herroeping terug naar <strong>Art by Lé, Hei-Ende 102, 2340 Vlimmeren (Beerse)</strong>, zorgvuldig verpakt, bij voorkeur in de originele verpakking. Liever terugbrengen? Spreek een moment af.</li>
                            <li>De kosten van het terugsturen zijn voor jouw rekening.</li>
                            <li>Je krijgt het aankoopbedrag terug binnen 14 dagen na je herroeping, met hetzelfde betaalmiddel. Herroep je de volledige bestelling, dan krijg je ook de oorspronkelijke standaard verzendkosten terug.</li>
                            <li>De terugbetaling mag wachten tot het werk terug is, of tot je aantoont dat je het hebt teruggestuurd.</li>
                        </Bullets>
                        <Note>
                            <strong>Kunstwerk op maat:</strong> een werk dat speciaal volgens jouw wensen gemaakt werd, valt niet onder het herroepingsrecht. Daarvoor gelden de afspraken op de pagina <Link href="/maatwerk" className="underline underline-offset-4">Kunstwerk op maat</Link>.
                        </Note>
                    </Topic>

                    <Topic id="k-schade" title="Schade en garantie">
                        <p>Komt je werk beschadigd aan? Gooi de verpakking nog niet weg en neem zo snel mogelijk contact op, met foto&apos;s van het werk, de schade, de binnenverpakking en de buitenkant van het pakket. Tot het werk bij jou is afgeleverd, is het de verantwoordelijkheid van Art by Lé.</p>
                        <p>Op elk werk geldt de wettelijke garantie van 2 jaar. Kleine natuurlijke verschillen in textuur of kleur horen bij handgemaakt werk en zijn geen gebrek.</p>
                    </Topic>

                    <Topic id="k-contact" title="Contact en klachten">
                        <p>
                            E-mail: <a href="mailto:byle.art@outlook.com" className="underline underline-offset-4">byle.art@outlook.com</a><br />
                            Telefoon: <a href="tel:+32491364332" className="underline underline-offset-4">+32 491 364 332</a>
                        </p>
                        <p>Je kan ook gewoon antwoorden op een van de e-mails over je bestelling. Komen we er samen niet uit, dan kan je terecht bij de Consumentenombudsdienst (consumentenombudsdienst.be).</p>
                        <p className="text-sm text-muted-foreground">
                            Alle details staan in de <Link href="/voorwaarden" className="underline underline-offset-4">algemene voorwaarden</Link>.
                        </p>
                    </Topic>
                </div>
            </div>
        </div>
    )
}
