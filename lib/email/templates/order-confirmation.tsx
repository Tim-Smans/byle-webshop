import {
  ButtonLink,
  EmailLayout,
  Heading,
  InfoBox,
  ItemsTable,
  Paragraph,
  SubHeading,
  TotalsTable,
  formatDate,
  formatMoney,
} from "./layout"
import type { EmailOrder } from "../order-data"

interface Props {
  order: EmailOrder
  orderUrl: string
  withdrawUrl: string
  termsUrl: string
  deliveryTimeText: string
  pickupLocationText: string
}

// Confirmation on a durable medium (legally required): everything the
// customer agreed to, incl. withdrawal information and the model form.
export default function OrderConfirmationEmail({
  order,
  orderUrl,
  withdrawUrl,
  termsUrl,
  deliveryTimeText,
  pickupLocationText,
}: Props) {
  const withdrawalApplies = order.items.some((item) => item.withdrawalApplicable)

  return (
    <EmailLayout preview={`Bedankt voor je bestelling ${order.orderNumber}`}>
      <Heading>Bedankt voor je bestelling, {order.customerFirstName}!</Heading>
      <Paragraph>
        Je betaling is goed ontvangen. Wat fijn dat een van mijn werken bij jou thuis een plekje krijgt.
        Hieronder vind je alle gegevens van je bestelling.
      </Paragraph>
      <Paragraph style={{ color: "#7a6a5c", fontSize: 14 }}>
        Bestelnummer <strong>{order.orderNumber}</strong> · besteld op {formatDate(order.createdAt)}
      </Paragraph>

      <SubHeading>Je bestelling</SubHeading>
      <ItemsTable items={order.items} />
      <TotalsTable
        rows={[
          ["Subtotaal", formatMoney(order.subtotal)],
          [order.shippingMethod === "pickup" ? "Afhalen" : "Verzending", order.shippingCost === 0 ? "Gratis" : formatMoney(order.shippingCost)],
          ...(order.vatAmount > 0 ? [["Waarvan btw", formatMoney(order.vatAmount)] as [string, string]] : []),
        ]}
        total={formatMoney(order.total)}
      />
      <Paragraph style={{ fontSize: 13, color: "#7a6a5c", marginTop: 8 }}>
        Volledig betaald via Mollie. De factuur zit als bijlage bij deze e-mail.
      </Paragraph>

      <SubHeading>{order.shippingMethod === "pickup" ? "Afhalen" : "Levering"}</SubHeading>
      {order.shippingMethod === "pickup" ? (
        <Paragraph>
          {pickupLocationText}. Ik neem contact met je op om een moment af te spreken zodra je werk klaarstaat.
        </Paragraph>
      ) : (
        <>
          <Paragraph>
            {order.customerFirstName} {order.customerLastName}<br />
            {order.shippingStreet}<br />
            {order.shippingPostalCode} {order.shippingCity}<br />
            {order.shippingCountry}
          </Paragraph>
          <Paragraph>
            {deliveryTimeText} Je kunstwerk wordt zorgvuldig verpakt. Zodra het verzonden is, krijg je een e-mail,
            indien beschikbaar met de gegevens om je pakket te volgen.
          </Paragraph>
        </>
      )}

      <ButtonLink href={orderUrl}>Bekijk je bestelling</ButtonLink>

      {withdrawalApplies && (
        <>
          <SubHeading>Herroepingsrecht (14 dagen bedenktijd)</SubHeading>
          <InfoBox>
            Je hebt het recht om deze aankoop binnen <strong>14 kalenderdagen</strong> zonder opgave van redenen
            te herroepen. Die termijn gaat in op de dag nadat jij (of iemand die je aanduidt) het kunstwerk hebt ontvangen.
            <br /><br />
            Herroepen kan eenvoudig online via{" "}
            <a href={withdrawUrl} style={{ color: "#6b4a2b" }}>Bestelling herroepen</a>,
            of met het modelformulier in bijlage (per e-mail of per post). Na je herroeping stuur je het werk
            zorgvuldig verpakt en onbeschadigd terug; de kosten voor het terugsturen zijn voor jouw rekening.
            <br /><br />
            Je krijgt het volledige bedrag, inclusief de oorspronkelijke standaard verzendkosten, terug binnen
            14 dagen na je herroeping. Ik mag wachten met terugbetalen tot ik het werk terug heb ontvangen of
            tot je aantoont dat je het hebt teruggestuurd. De terugbetaling gebeurt met hetzelfde betaalmiddel.
          </InfoBox>
        </>
      )}

      <SubHeading>Goed om te weten</SubHeading>
      <Paragraph style={{ fontSize: 14 }}>
        Bij je origineel kunstwerk ontvang je een Certificaat van Echtheid. Op elk werk geldt de wettelijke
        garantie van 2 jaar. Komt je werk beschadigd aan? Neem dan zo snel mogelijk contact op en maak foto&apos;s
        van het werk, de schade en de verpakking.
      </Paragraph>
      <Paragraph style={{ fontSize: 14 }}>
        Op deze bestelling zijn de <a href={termsUrl} style={{ color: "#6b4a2b" }}>algemene voorwaarden</a> van
        Art by Lé van toepassing. Vragen? Antwoord gewoon op deze e-mail.
      </Paragraph>

      <Paragraph style={{ marginTop: 24 }}>
        Hartelijke groet,<br />
        Els – Art by Lé
      </Paragraph>
    </EmailLayout>
  )
}
