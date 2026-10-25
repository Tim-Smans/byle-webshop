import { EmailLayout, Heading, InfoBox, ItemsTable, Paragraph, SubHeading, type EmailOrderItem } from "./layout"

interface Props {
  name: string
  orderNumber: string
  submittedAtLabel: string
  items: EmailOrderItem[]
  reason: string | null
}

// Acknowledgement of receipt on a durable medium: what was withdrawn and when
export default function WithdrawalReceivedEmail({ name, orderNumber, submittedAtLabel, items, reason }: Props) {
  return (
    <EmailLayout preview={`Je herroeping voor bestelling ${orderNumber} is geregistreerd`}>
      <Heading>Je herroeping is geregistreerd</Heading>
      <Paragraph>Dag {name},</Paragraph>
      <Paragraph>
        Hierbij bevestig ik dat ik je herroeping voor bestelling <strong>{orderNumber}</strong> heb ontvangen
        op <strong>{submittedAtLabel}</strong>.
      </Paragraph>

      <SubHeading>Herroepen werk{items.length === 1 ? "" : "en"}</SubHeading>
      <ItemsTable items={items} />
      {reason && <Paragraph style={{ fontSize: 14, color: "#7a6a5c" }}>Opgegeven reden: {reason}</Paragraph>}

      <SubHeading>Wat nu?</SubHeading>
      <InfoBox>
        <strong>Terugsturen:</strong> stuur het werk binnen 14 dagen na vandaag terug naar
        <br />
        Art by Lé, Hei-Ende 102, 2340 Vlimmeren (Beerse), België.
        <br /><br />
        Verpak het werk zorgvuldig zodat het onbeschadigd aankomt; gebruik bij voorkeur de originele verpakking.
        De kosten voor het terugsturen zijn voor jouw rekening. Liever terugbrengen? Antwoord op deze e-mail om een
        moment af te spreken.
        <br /><br />
        <strong>Terugbetaling:</strong> je krijgt het aankoopbedrag binnen 14 dagen terug, met hetzelfde
        betaalmiddel. Herroep je de volledige bestelling, dan krijg je ook de oorspronkelijke standaard
        verzendkosten terug. Ik mag wachten met terugbetalen tot ik het werk terug heb ontvangen of tot je
        aantoont dat je het hebt teruggestuurd.
      </InfoBox>

      <Paragraph style={{ marginTop: 24 }}>
        Hartelijke groet,<br />
        Els – Art by Lé
      </Paragraph>
    </EmailLayout>
  )
}
