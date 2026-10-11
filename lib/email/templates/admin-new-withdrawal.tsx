import { ButtonLink, EmailLayout, Heading, ItemsTable, Paragraph, SubHeading, type EmailOrderItem } from "./layout"

interface Props {
  name: string
  email: string
  orderNumber: string
  submittedAtLabel: string
  refundDeadlineLabel: string
  items: EmailOrderItem[]
  reason: string | null
  adminUrl: string
}

export default function AdminNewWithdrawalEmail(props: Props) {
  return (
    <EmailLayout preview={`Herroeping voor bestelling ${props.orderNumber}`}>
      <Heading>Herroeping voor {props.orderNumber}</Heading>
      <Paragraph>
        {props.name} (<a href={`mailto:${props.email}`}>{props.email}</a>) heeft op {props.submittedAtLabel} de
        volgende werken herroepen:
      </Paragraph>
      <ItemsTable items={props.items} />
      {props.reason && <Paragraph>Reden: {props.reason}</Paragraph>}

      <SubHeading>Te doen</SubHeading>
      <Paragraph>
        Wacht op het teruggestuurde werk en betaal terug via de admin, uiterlijk op{" "}
        <strong>{props.refundDeadlineLabel}</strong> (14 dagen na de herroeping). Je mag wachten met terugbetalen
        tot het werk terug is of de klant een verzendbewijs stuurt.
      </Paragraph>
      <ButtonLink href={props.adminUrl}>Herroeping openen</ButtonLink>
    </EmailLayout>
  )
}
