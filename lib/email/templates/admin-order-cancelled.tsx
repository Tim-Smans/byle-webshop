import { ButtonLink, EmailLayout, Heading, ItemsTable, Paragraph, formatMoney, type EmailOrderItem } from "./layout"

export default function AdminOrderCancelledEmail({
  customerName,
  orderNumber,
  amount,
  items,
  adminUrl,
}: {
  customerName: string
  orderNumber: string
  amount: number
  items: EmailOrderItem[]
  adminUrl: string
}) {
  return (
    <EmailLayout preview={`${customerName} annuleerde bestelling ${orderNumber}`}>
      <Heading>Bestelling {orderNumber} geannuleerd</Heading>
      <Paragraph>
        {customerName} heeft de bestelling geannuleerd vóór verzending. {formatMoney(amount)} werd automatisch
        terugbetaald via Mollie en er is een creditnota aangemaakt. Je hoeft niets te verzenden.
      </Paragraph>
      <ItemsTable items={items} />
      <Paragraph>
        De werken staan terug te koop. Zet ze via &quot;aanpassen&quot; terug in de juiste collectie.
      </Paragraph>
      <ButtonLink href={adminUrl}>Bestelling openen</ButtonLink>
    </EmailLayout>
  )
}
