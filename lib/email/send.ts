import "server-only"
import type { ReactNode } from "react"
import { Resend } from "resend"

// Where order and withdrawal notifications for Lé go
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "byle.art@outlook.com"

// Use an address on a domain verified in Resend, e.g.
// "Art by Lé <bestellingen@artbyle.be>"
const DEFAULT_FROM = "Art by Lé <contact@timsmans.be>"

export interface EmailAttachment {
  filename: string
  content: Buffer
}

export async function sendEmail(options: {
  to: string
  subject: string
  react: ReactNode
  attachments?: EmailAttachment[]
  replyTo?: string
  // Resend ignores a second send with the same key (within 24h)
  idempotencyKey?: string
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY is not set")

  const { error } = await new Resend(apiKey).emails.send(
    {
      from: process.env.EMAIL_FROM ?? DEFAULT_FROM,
      to: options.to,
      subject: options.subject,
      react: options.react,
      attachments: options.attachments,
      replyTo: options.replyTo,
    },
    options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined
  )

  if (error) throw new Error(`E-mail niet verzonden: ${error.message}`)
}
