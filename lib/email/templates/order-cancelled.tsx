import { EmailLayout, Heading, ItemsTable, Paragraph, formatMoney, type EmailOrderItem } from "./layout"

export default function OrderCancelledEmail({
  firstName,
  orderNumber,
  amount,
  items,
}: {
  firstName: string
  orderNumber: string
  amount: number
  items: EmailOrderItem[]
}) {
  return (
    <EmailLayout preview={`Je bestelling ${orderNumber} is geannuleerd`}>
      <Heading>Je bestelling is geannuleerd</Heading>
      <Paragraph>Dag {firstName},</Paragraph>
      <Paragraph>
        Je bestelling <strong>{orderNumber}</strong> is geannuleerd. Ik heb het volledige bedrag
        van <strong>{formatMoney(amount)}</strong> terugbetaald, met hetzelfde betaalmiddel als je bestelling.
        Afhankelijk van je bank kan het enkele werkdagen duren voor het op je rekening staat.
      </Paragraph>
      <ItemsTable items={items} />
      <Paragraph style={{ fontSize: 14, color: "#7a6a5c" }}>
        De creditnota vind je bij je bestelling. Was dit een vergissing? Antwoord dan op deze e-mail; zolang het werk
        niet verkocht is, kan je het opnieuw bestellen.
      </Paragraph>
      <Paragraph style={{ marginTop: 24 }}>
        Hartelijke groet,<br />
        Els – Art by Lé
      </Paragraph>
    </EmailLayout>
  )
}
