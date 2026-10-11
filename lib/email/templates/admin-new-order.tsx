import { ButtonLink, EmailLayout, Heading, InfoBox, ItemsTable, Paragraph, SubHeading, TotalsTable, formatMoney } from "./layout"
import type { EmailOrder } from "../order-data"

export default function AdminNewOrderEmail({ order, adminUrl }: { order: EmailOrder; adminUrl: string }) {
  return (
    <EmailLayout preview={`Nieuwe bestelling ${order.orderNumber} – ${formatMoney(order.total)}`}>
      <Heading>Nieuwe bestelling {order.orderNumber}</Heading>
      <Paragraph>
        {order.customerFirstName} {order.customerLastName} heeft betaald: <strong>{formatMoney(order.total)}</strong>.
      </Paragraph>

      {order.hasStockConflict && (
        <InfoBox>
          <strong>Let op:</strong> deze betaling kwam binnen nadat de reservatie verlopen was, en een of meer werken
          waren intussen al aan iemand anders verkocht. Neem contact op met de klant en betaal terug.
        </InfoBox>
      )}

      <SubHeading>Werken</SubHeading>
      <ItemsTable items={order.items} />
      <TotalsTable
        rows={[
          ["Subtotaal", formatMoney(order.subtotal)],
          [order.shippingMethod === "pickup" ? "Afhalen" : "Verzending", formatMoney(order.shippingCost)],
        ]}
        total={formatMoney(order.total)}
      />

      <SubHeading>Klant</SubHeading>
      <Paragraph>
        {order.companyName && <>{order.companyName}{order.vatNumber ? ` (${order.vatNumber})` : ""}<br /></>}
        {order.customerFirstName} {order.customerLastName}<br />
        <a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a>
        {order.customerPhone && <><br />{order.customerPhone}</>}
      </Paragraph>

      <SubHeading>{order.shippingMethod === "pickup" ? "Komt afhalen" : "Verzenden naar"}</SubHeading>
      {order.shippingMethod === "pickup" ? (
        <Paragraph>Spreek een afhaalmoment af met de klant.</Paragraph>
      ) : (
        <Paragraph>
          {order.shippingStreet}<br />
          {order.shippingPostalCode} {order.shippingCity}<br />
          {order.shippingCountry}
        </Paragraph>
      )}

      <ButtonLink href={adminUrl}>Bestelling openen in de admin</ButtonLink>
    </EmailLayout>
  )
}
