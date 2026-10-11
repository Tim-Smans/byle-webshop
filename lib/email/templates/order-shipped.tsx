import { ButtonLink, EmailLayout, Heading, InfoBox, ItemsTable, Paragraph } from "./layout"
import type { EmailOrder } from "../order-data"

export default function OrderShippedEmail({
  order,
  orderUrl,
  withdrawUrl,
}: {
  order: EmailOrder
  orderUrl: string
  withdrawUrl: string
}) {
  const withdrawalApplies = order.items.some((item) => item.withdrawalApplicable)

  return (
    <EmailLayout preview={`Je kunstwerk is onderweg – bestelling ${order.orderNumber}`}>
      <Heading>Je kunstwerk is onderweg!</Heading>
      <Paragraph>
        Dag {order.customerFirstName}, je bestelling <strong>{order.orderNumber}</strong> is zorgvuldig verpakt
        en vertrokken naar {order.shippingStreet}, {order.shippingPostalCode} {order.shippingCity}.
      </Paragraph>

      <ItemsTable items={order.items} />

      {order.trackingCode && (
        <InfoBox>
          Je trackingcode: <strong style={{ fontFamily: "monospace", fontSize: 16 }}>{order.trackingCode}</strong>
          <br />
          Hiermee kan je je pakket volgen op de website van de vervoerder.
        </InfoBox>
      )}
      <ButtonLink href={orderUrl}>Bekijk je bestelling</ButtonLink>

      <Paragraph style={{ fontSize: 14 }}>
        Komt je werk beschadigd aan? Gooi de verpakking dan nog niet weg, maak foto&apos;s van het werk, de schade
        en de verpakking, en neem zo snel mogelijk contact op.
      </Paragraph>

      {withdrawalApplies && (
        <InfoBox>
          Je hebt 14 dagen bedenktijd vanaf de dag na ontvangst. Herroepen kan via{" "}
          <a href={withdrawUrl} style={{ color: "#6b4a2b" }}>Bestelling herroepen</a>.
        </InfoBox>
      )}

      <Paragraph style={{ marginTop: 24 }}>
        Veel kijkplezier!<br />
        Els – Art by Lé
      </Paragraph>
    </EmailLayout>
  )
}
