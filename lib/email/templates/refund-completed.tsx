import { EmailLayout, Heading, Paragraph, formatMoney } from "./layout"

export default function RefundCompletedEmail({
  firstName,
  orderNumber,
  amount,
}: {
  firstName: string
  orderNumber: string
  amount: number
}) {
  return (
    <EmailLayout preview={`Terugbetaling van ${formatMoney(amount)} voor bestelling ${orderNumber}`}>
      <Heading>Je terugbetaling is onderweg</Heading>
      <Paragraph>Dag {firstName},</Paragraph>
      <Paragraph>
        Ik heb <strong>{formatMoney(amount)}</strong> voor bestelling <strong>{orderNumber}</strong> terugbetaald,
        met hetzelfde betaalmiddel als je bestelling. Afhankelijk van je bank kan het enkele werkdagen duren voor het
        bedrag op je rekening staat. De creditnota vind je bij je bestelling.
      </Paragraph>
      <Paragraph style={{ marginTop: 24 }}>
        Hartelijke groet,<br />
        Els – Art by Lé
      </Paragraph>
    </EmailLayout>
  )
}
