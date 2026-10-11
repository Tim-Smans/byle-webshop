import Link from "next/link"
import { Bullets, Flow, Note, PartHeader, Steps, SubTitle, Table, Topic, TopicIndex, Ui, Warn } from "./docs-ui"

// Only rendered on the server for logged-in admins (see app/docs/page.tsx)

const TOPICS = [
    { id: "a-dashboard", title: "Dashboard" },
    { id: "a-instellen", title: "Eenmalig instellen" },
    { id: "a-bestelling", title: "Een bestelling afhandelen" },
    { id: "a-statussen", title: "Statussen" },
    { id: "a-annulaties", title: "Annulaties" },
    { id: "a-herroepingen", title: "Herroepingen" },
    { id: "a-conflict", title: "Voorraadconflict" },
    { id: "a-mollie", title: "Mollie" },
    { id: "a-facturen", title: "Facturen" },
    { id: "a-mails", title: "Automatische e-mails" },
    { id: "a-kunstwerken", title: "Kunstwerken" },
    { id: "a-termijnen", title: "Termijnen" },
    { id: "a-problemen", title: "Als iets misloopt" },
]

const linkClass = "underline underline-offset-4"

export default function AdminGuide() {
    return (
        <div>
            <PartHeader
                id="admin"
                eyebrow="Alleen voor de admin"
                title="De webshop beheren"
                intro="Alles wat je als beheerder doet: instellen, bestellingen afhandelen, herroepingen terugbetalen en facturen. Dit deel zie je alleen als je ingelogd bent."
            />
            <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6 lg:gap-12 pt-6">
                <TopicIndex label="Inhoud voor de admin" items={TOPICS} />
                <div className="min-w-0 max-w-2xl">
                    <Topic id="a-dashboard" title="Dashboard">
                        <p>Op het <Link href="/admin" className={linkClass}>dashboard</Link> staat het blok <strong>Webshop</strong>:</p>
                        <Bullets>
                            <li><strong>Klaar te maken</strong>: betaalde bestellingen die je nog moet verzenden of laten afhalen. Oranje als er iets wacht.</li>
                            <li><strong>Open herroepingen</strong>: herroepingen die je nog moet afhandelen. Rood als er iets openstaat.</li>
                            <li><strong>Omzet deze maand</strong>: betaalde bestellingen min terugbetalingen.</li>
                            <li>De kaarten <strong>Bestellingen</strong>, <strong>Mollie</strong>, <strong>Verzending</strong>, <strong>Herroepingen &amp; retours</strong> en <strong>Facturen</strong>.</li>
                        </Bullets>
                        <p>Je hoeft het dashboard niet dagelijks te controleren: bij elke nieuwe bestelling, annulatie en herroeping krijg je een e-mail.</p>
                    </Topic>

                    <Topic id="a-instellen" title="Eenmalig instellen">
                        <SubTitle>Verzendtarieven</SubTitle>
                        <Steps>
                            <li>Ga naar <Link href="/admin/verzending" className={linkClass}>Verzending</Link>.</li>
                            <li>Kies onder <Ui>Land toevoegen</Ui> een land en vul een prijs in voor een <strong>klein</strong> en een <strong>groot</strong> werk. Komma of punt mag allebei.</li>
                            <li>Klik op <Ui>Toevoegen</Ui>. Met de schakelaar <strong>Actief</strong> zet je een land aan of uit; dat wordt meteen opgeslagen.</li>
                        </Steps>
                        <p>Alleen actieve landen kan een klant kiezen. Per bestelling wordt één keer verzending aangerekend: het tarief van het grootste werk.</p>
                        <SubTitle>Formaat van de kunstwerken</SubTitle>
                        <p>Open elk groot werk via <Ui>aanpassen</Ui> en kies bij <strong>Formaat voor verzending</strong> voor <strong>Groot</strong>. Alle bestaande werken staan standaard op Klein.</p>
                    </Topic>

                    <Topic id="a-bestelling" title="Een bestelling afhandelen">
                        <p>Je krijgt een e-mail <em>Nieuwe bestelling ABL-…</em>. Open <Link href="/admin/bestellingen" className={linkClass}>Bestellingen</Link>. Het tabblad <strong>Klaar te maken</strong> staat standaard open, met de oudste bestelling bovenaan. Klik op de bestelling.</p>
                        <p>Bovenaan staat telkens één kaart <strong>Volgende stap</strong> met alleen wat er nu moet gebeuren.</p>

                        <SubTitle>Bij verzenden</SubTitle>
                        <Flow steps={["Betaald", "Verzonden", "Geleverd", "Afgerond"]} />
                        <Steps>
                            <li>Pak het werk in en verzend het binnen 5 werkdagen.</li>
                            <li>Vul de trackingcode van bpost in (optioneel), laat <Ui>Klant een e-mail sturen</Ui> aangevinkt en klik op <Ui>Markeer als verzonden</Ui>. De klant krijgt de verzendmail met de knop <em>Volg je pakket bij bpost</em>.</li>
                            <li>Klik op de bestelpagina op <Ui>Volgen bij bpost</Ui> en kijk op welke dag het pakket afgeleverd werd. Vul die datum in bij <strong>Geleverd op</strong> en klik op <Ui>Markeer als geleverd</Ui>.</li>
                            <li>Klaar. De bestelling staat op <em>Afgerond</em> zodra de bedenktijd voorbij is; daar hoef je niets voor te doen.</li>
                        </Steps>

                        <SubTitle>Bij afhalen</SubTitle>
                        <Flow steps={["Betaald", "Afgehaald", "Afgerond"]} />
                        <Steps>
                            <li>Spreek een moment af met de klant. Het telefoonnummer en e-mailadres staan rechts op de bestelpagina. Een afspraak kan je noteren in <strong>Notitie</strong>, die alleen jij ziet.</li>
                            <li>Na het afhalen vul je de datum in en klik je op <Ui>Markeer als afgehaald</Ui>.</li>
                        </Steps>

                        <Warn>
                            <strong>Duid altijd &quot;geleverd&quot; of &quot;afgehaald&quot; aan.</strong> Die datum start de bedenktijd van 14 dagen. Zonder die datum blijft de klant onbeperkt kunnen herroepen.
                        </Warn>

                        <SubTitle>Verder op de bestelpagina</SubTitle>
                        <Bullets>
                            <li><strong>Geschiedenis</strong>: wie deed wat en wanneer (jij, de klant, Mollie of het systeem).</li>
                            <li><strong>Documenten</strong>: factuur en creditnota&apos;s, <Ui>Bevestiging opnieuw versturen</Ui> en <Ui>Bekijk zoals de klant</Ui>.</li>
                            <li><strong>Betaling</strong>: de betaalmethode en het nummer van de betaling bij Mollie.</li>
                            <li>Bij een bedrijfsklant staat er een herinnering om ook een Peppol e-factuur op te maken.</li>
                        </Bullets>
                    </Topic>

                    <Topic id="a-statussen" title="Statussen">
                        <Table
                            head={["Status", "Betekenis", "Wat jij doet"]}
                            rows={[
                                ["Wacht op betaling", "De klant is aan het betalen; de werken zijn 30 minuten gereserveerd.", "Niets."],
                                ["Betaald – klaarmaken", "Betaald, nog niet verzonden of afgehaald. De klant kan nog annuleren.", "Verzenden of afhaling afspreken."],
                                ["Verzonden", "Onderweg naar de klant.", "Leverdatum invullen zodra het pakket aankwam."],
                                ["Geleverd", "De bedenktijd loopt.", "Niets."],
                                ["Afgerond", "De bedenktijd is voorbij.", "Niets."],
                                ["Herroepen", "De klant herroept de volledige bestelling.", "Retour afwachten en terugbetalen."],
                                ["Terugbetaald", "Volledig terugbetaald (annulatie of herroeping).", "Niets."],
                                ["Betaling mislukt / Geannuleerd", "Nooit betaald. De werken staan weer te koop.", "Niets. Na 12 maanden worden deze bestellingen automatisch verwijderd."],
                            ]}
                        />
                    </Topic>

                    <Topic id="a-annulaties" title="Annulaties">
                        <SubTitle>Door de klant</SubTitle>
                        <p>Zolang een bestelling niet verzonden of afgehaald is, kan de klant ze zelf annuleren. Dat gaat volledig automatisch: Mollie betaalt terug, er wordt een creditnota gemaakt, de werken komen terug te koop en de klant krijgt een mail. Jij krijgt de mail <em>Bestelling … geannuleerd door de klant</em>: je hoeft niets te verzenden.</p>
                        <p>Annuleert de klant terwijl jij net op <Ui>Markeer als verzonden</Ui> klikt, dan wint wie eerst was. De andere krijgt een melding.</p>
                        <SubTitle>Door jou</SubTitle>
                        <p>Raakt een werk beschadigd vóór verzending, of is er een voorraadconflict? Klik onderaan de bestelpagina op <Ui>Bestelling annuleren en terugbetalen</Ui>. Het volledige bedrag gaat terug via Mollie, met creditnota en mail naar de klant. Met het vinkje <Ui>Werken terug te koop zetten</Ui> komen de werken terug in de shop.</p>
                        <Note>Komt een werk terug te koop, dan staat het nog in de collectie <strong>Verkocht</strong>. Zet het via <Ui>aanpassen</Ui> terug in de juiste collectie.</Note>
                    </Topic>

                    <Topic id="a-herroepingen" title="Herroepingen">
                        <p>Je krijgt een mail <em>Herroeping voor bestelling ABL-…</em> met de uiterste datum om terug te betalen. Open <Link href="/admin/herroepingen" className={linkClass}>Herroepingen &amp; retours</Link>. Per herroeping zie je hoeveel dagen je nog hebt; vanaf 3 dagen kleurt dat rood.</p>
                        <p>Op de bestelpagina staat een rode kaart <strong>Herroeping</strong>:</p>
                        <Steps>
                            <li>Wacht tot het werk terug is en controleer het. Klik dan op <Ui>Retour ontvangen</Ui>.</li>
                            <li>Het bedrag om terug te betalen staat er al. Bij herroeping van de volledige bestelling zitten de oorspronkelijke verzendkosten erin, zoals de wet vraagt.</li>
                            <li>Laat <Ui>Werk terug te koop zetten</Ui> aangevinkt als het werk opnieuw verkocht mag worden.</li>
                            <li>Klik op <Ui>Terugbetalen via Mollie</Ui> en bevestig. De creditnota en de mail naar de klant gaan automatisch.</li>
                        </Steps>
                        <Warn>Betaal uiterlijk <strong>14 dagen na de herroeping</strong> terug. Je mag wachten tot het werk terug is of de klant een verzendbewijs stuurt, maar niet langer.</Warn>
                        <SubTitle>Afwijzen</SubTitle>
                        <p>Klopt een herroeping niet, bijvoorbeeld omdat ze buiten de termijn viel of over maatwerk gaat? Klik op <Ui>Herroeping afwijzen</Ui> en geef een reden. Die reden is verplicht. Laat de klant daarna persoonlijk weten waarom.</p>
                    </Topic>

                    <Topic id="a-conflict" title="Voorraadconflict">
                        <p>Heel uitzonderlijk betaalt een klant pas nadat zijn reservatie van 30 minuten verlopen is, terwijl iemand anders het werk intussen al kocht. Dan:</p>
                        <Bullets>
                            <li>krijg je een mail met <em>⚠️ Terugbetaling nodig</em>;</li>
                            <li>staat er een rode melding op de bestelpagina;</li>
                            <li>krijgt de klant géén bevestiging dat het werk eraan komt.</li>
                        </Bullets>
                        <p>Neem contact op met de klant en gebruik <Ui>Bestelling annuleren en terugbetalen</Ui>. Het werk blijft bij de andere koper.</p>
                    </Topic>

                    <Topic id="a-mollie" title="Mollie">
                        <p>
                            Onder <Link href="/admin/mollie" className={linkClass}>Mollie</Link> zie je alle betalingen, terugbetalingen
                            en chargebacks, rechtstreeks uit Mollie en gekoppeld aan je bestellingen. Bovenaan staat of je in
                            <strong> Testmodus</strong> of <strong>Live</strong> werkt. Kies de periode met de knoppen
                            <em> Laatste 30 dagen</em>, <em>Deze maand</em>, <em>Dit jaar</em> of <em>Alles</em>.
                        </p>

                        <SubTitle>Aandacht nodig</SubTitle>
                        <p>Dit rode blok verschijnt alleen als er iets niet klopt:</p>
                        <Bullets>
                            <li>
                                <strong>Betaald bij Mollie, maar niet in de webshop</strong>, bijvoorbeeld als de melding van Mollie niet
                                aankwam. Klik op <Ui>Nu synchroniseren</Ui>: de bestelling gaat op betaald en de factuur en de
                                bevestiging worden verstuurd.
                            </li>
                            <li>
                                <strong>Terugbetalingen met een andere status dan bij Mollie.</strong> Klik op <Ui>Statussen bijwerken</Ui>.
                            </li>
                            <li>
                                <strong>Mislukte terugbetalingen.</strong> Meestal is je Mollie-saldo te laag. Vul het aan in Mollie en
                                betaal opnieuw terug vanaf de bestelling.
                            </li>
                        </Bullets>

                        <SubTitle>Cijfers</SubTitle>
                        <Table
                            head={["Cijfer", "Betekenis"]}
                            rows={[
                                ["Ontvangen", "Alle betaalde bestellingen in de periode."],
                                ["Terugbetaald", "Wat je via annulaties en herroepingen terugbetaalde."],
                                ["Netto", "Ontvangen min terugbetaald en chargebacks."],
                                ["Gemiddelde betaling", "Ontvangen gedeeld door het aantal betaalde bestellingen."],
                                ["Geslaagde betalingen", "Welk deel van de afgeronde betaalpogingen effectief betaald werd. Verlopen of geannuleerd betekent dat de klant het betalen niet afrondde."],
                                ["Chargebacks", "Betalingen die een klant via zijn bank of kaartuitgever terugdraaide. Hoort normaal 0 te zijn."],
                            ]}
                        />
                        <p>
                            Daaronder staan een grafiek van wat je per dag (of per maand) ontving, met het bedrag als je over een staaf
                            gaat, en de verdeling per betaalmethode en per status.
                        </p>

                        <SubTitle>Lijsten</SubTitle>
                        <Bullets>
                            <li>
                                <strong>Betalingen</strong>: filter op status of zoek op bestelnummer, naam of Mollie-id. Klik op het
                                bestelnummer om de bestelling te openen, of op het Mollie-id om de betaling in Mollie te bekijken.
                            </li>
                            <li><strong>Terugbetalingen</strong> en <strong>Chargebacks</strong>, telkens met de bijhorende bestelling.</li>
                            <li>
                                <strong>Ingeschakelde betaalmethoden</strong>, met het minimum- en maximumbedrag. Staat overschrijving aan,
                                dan krijg je een waarschuwing: zet die best uit in Mollie.
                            </li>
                        </Bullets>
                        <Note>
                            Je <strong>saldo</strong>, de <strong>uitbetalingen</strong> naar je rekening en de <strong>Mollie-kosten</strong>{" "}
                            staan niet op deze pagina. Die vind je in het Mollie-dashboard zelf, via <Ui>Open Mollie-dashboard</Ui>.
                        </Note>
                    </Topic>

                    <Topic id="a-facturen" title="Facturen">
                        <Bullets>
                            <li>Een factuur wordt automatisch gemaakt zodra een bestelling betaald is, en gaat mee met de bevestigingsmail.</li>
                            <li>Nummering per jaar en zonder gaten: <strong>2026-0001</strong>, <strong>2026-0002</strong>, …</li>
                            <li>Op elke factuur staat <em>Bijzondere vrijstellingsregeling kleine ondernemingen</em>, want er wordt geen btw aangerekend.</li>
                            <li>Een factuur kan niet gewijzigd of verwijderd worden. Bij een terugbetaling komt er automatisch een <strong>creditnota</strong> bij.</li>
                        </Bullets>
                        <p>Onder <Link href="/admin/facturen" className={linkClass}>Facturen</Link>:</p>
                        <Bullets>
                            <li>elke factuur en creditnota downloaden als PDF;</li>
                            <li><Ui>Exporteren naar Excel</Ui>: een lijst voor je boekhouder, oudste eerst;</li>
                            <li><Ui>Ontbrekende facturen aanmaken</Ui>: een vangnet als een betaalde bestelling geen factuur kreeg.</li>
                        </Bullets>
                        <Note><strong>Bedrijfsklanten:</strong> koopt een bedrijf met btw-nummer, maak dan ook een Peppol e-factuur op in je boekhoudsoftware. Dat doet de webshop niet.</Note>
                    </Topic>

                    <Topic id="a-mails" title="Automatische e-mails">
                        <Table
                            head={["E-mail", "Wanneer", "Naar"]}
                            rows={[
                                [<>Bevestiging van je bestelling<br /><span className="text-xs text-muted-foreground">met factuur, voorwaarden en modelformulier</span></>, "Betaling ontvangen", "Klant"],
                                ["Nieuwe bestelling", "Betaling ontvangen", "Jij"],
                                ["Je kunstwerk is onderweg", "Jij klikt op Markeer als verzonden (met het vinkje aan)", "Klant"],
                                ["Je bestelling is geannuleerd", "De klant annuleert", "Klant"],
                                ["Bestelling geannuleerd door de klant", "De klant annuleert", "Jij"],
                                ["Je herroeping is geregistreerd", "De klant herroept", "Klant"],
                                ["Herroeping voor bestelling", "De klant herroept", "Jij"],
                                ["Terugbetaling voor bestelling", "Jij betaalt terug", "Klant"],
                            ]}
                        />
                        <p>Antwoordt een klant op een mail, dan komt dat antwoord bij <strong>byle.art@outlook.com</strong> terecht.</p>
                    </Topic>

                    <Topic id="a-kunstwerken" title="Kunstwerken">
                        <Bullets>
                            <li><strong>Verkocht</strong>: na een betaling gaat een werk automatisch op verkocht en naar de collectie <strong>Verkocht</strong>. De knop &quot;verkocht&quot; in de galerij heb je alleen nog nodig voor verkopen buiten de webshop.</li>
                            <li><strong>Uitgelicht</strong> blijft staan als je een werk bewerkt.</li>
                            <li><strong>Formaat</strong> (klein of groot) bepaalt het verzendtarief. Kies het bij elk nieuw werk.</li>
                            <li><strong>Verzendinformatie</strong> in het formulier is een vrije tekst die bij het werk getoond wordt. De echte verzendkosten komen uit de tarieven onder Verzending.</li>
                        </Bullets>
                    </Topic>

                    <Topic id="a-termijnen" title="Termijnen">
                        <Table
                            head={["Wat", "Termijn"]}
                            rows={[
                                ["Reservatie tijdens het betalen", <strong key="t">30 minuten</strong>],
                                ["Verzenden na betaling", <strong key="t">5 werkdagen</strong>],
                                ["Bedenktijd van de klant", <strong key="t">14 dagen</strong>],
                                ["Klant stuurt het werk terug", <strong key="t">14 dagen na herroeping</strong>],
                                ["Jij betaalt terug", <strong key="t">14 dagen na herroeping</strong>],
                                ["Onbetaalde bestellingen bewaard", <strong key="t">12 maanden</strong>],
                                ["Facturen en bestellingen bewaren", <strong key="t">10 jaar</strong>],
                            ]}
                        />
                        <p>De bedenktijd loopt tot en met de 14<sup>e</sup> dag na de dag van levering. Op de bestelpagina staat de exacte einddatum.</p>
                    </Topic>

                    <Topic id="a-problemen" title="Als iets misloopt">
                        <SubTitle>De klant zegt dat de bevestigingsmail niet aankwam</SubTitle>
                        <p>Vraag eerst om in de map ongewenste e-mail te kijken. Gebruik anders <Ui>Bevestiging opnieuw versturen</Ui> op de bestelpagina. De mail gaat opnieuw, met de bijlagen.</p>
                        <SubTitle>Mollie toont &quot;betaald&quot;, maar de bestelling wacht nog op betaling</SubTitle>
                        <p>Open <Link href="/admin/mollie" className={linkClass}>Mollie</Link>: de betaling staat dan onder <strong>Aandacht nodig</strong>. Klik op <Ui>Nu synchroniseren</Ui>. De bestelling gaat op betaald, met factuur en mails. Je kan ook de bestelling openen via <Ui>Bekijk zoals de klant</Ui>; die pagina vraagt de status ook opnieuw op bij Mollie.</p>
                        <SubTitle>Een betaalde bestelling heeft geen factuur</SubTitle>
                        <p>Klik op <Link href="/admin/facturen" className={linkClass}>Facturen</Link> → <Ui>Ontbrekende facturen aanmaken</Ui>.</p>
                        <SubTitle>Terugbetalen lukt niet</SubTitle>
                        <p>Mollie betaalt terug vanuit je Mollie-saldo. Is dat te laag, dan weigert Mollie. Kijk in het Mollie-dashboard, vul je saldo aan en probeer opnieuw. Er is in dat geval niets terugbetaald. Mislukte terugbetalingen zie je ook onder <Link href="/admin/mollie" className={linkClass}>Mollie</Link> → <strong>Aandacht nodig</strong>.</p>
                        <SubTitle>Een terugbetaling blijft op &quot;in behandeling&quot; staan</SubTitle>
                        <p>Mollie voert een terugbetaling soms pas na een tijdje uit. Klik onder <Link href="/admin/mollie" className={linkClass}>Mollie</Link> op <Ui>Statussen bijwerken</Ui> om de actuele status uit Mollie over te nemen.</p>
                        <SubTitle>Een werk staat na een terugbetaling in de verkeerde collectie</SubTitle>
                        <p>Open het werk via <Ui>aanpassen</Ui> en kies de juiste collectie.</p>
                        <SubTitle>Iets anders</SubTitle>
                        <p>Een aantal instellingen staat vast in de code: de levertermijn, de reservatietijd, het btw-regime en de teksten van de voorwaarden. Wil je daar iets aan veranderen, vraag het aan Tim.</p>
                    </Topic>
                </div>
            </div>
        </div>
    )
}
