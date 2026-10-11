/* eslint-disable @next/next/no-head-element, @next/next/no-img-element -- e-mail HTML, not a Next page */
import type { CSSProperties, ReactNode } from "react"

// Email-safe building blocks: tables and inline styles only

export const colors = {
  background: "#f7efe2",
  card: "#ffffff",
  text: "#3b2f25",
  muted: "#7a6a5c",
  border: "#e6dccf",
  accent: "#6b4a2b",
}

const money = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" })
export const formatMoney = (amount: number) => money.format(amount)

const dateFormatter = new Intl.DateTimeFormat("nl-BE", { dateStyle: "long", timeZone: "Europe/Brussels" })
export const formatDate = (value: string | Date) => dateFormatter.format(new Date(value))

export function EmailLayout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: colors.background, fontFamily: "Georgia, 'Times New Roman', serif", color: colors.text }}>
        {/* Inbox preview text */}
        <div style={{ display: "none", maxHeight: 0, overflow: "hidden" }}>{preview}</div>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: colors.background }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: "32px 16px" }}>
                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 600 }}>
                  <tbody>
                    <tr>
                      <td style={{ paddingBottom: 20, textAlign: "center" }}>
                        <div style={{ fontSize: 26, letterSpacing: 2 }}>Art by Lé</div>
                        <div style={{ fontSize: 12, color: colors.muted, letterSpacing: 3, textTransform: "uppercase", fontFamily: "Arial, sans-serif" }}>
                          Handcrafted Art
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ backgroundColor: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, padding: 32 }}>
                        {children}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "20px 8px", textAlign: "center", fontSize: 12, lineHeight: 1.6, color: colors.muted, fontFamily: "Arial, sans-serif" }}>
                        Art by Lé · Hei-Ende 102, 2340 Vlimmeren (Beerse), België<br />
                        byle.art@outlook.com · +32 491 364 332 · Btw BE 1043.462.454
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

export function Heading({ children }: { children: ReactNode }) {
  return <h1 style={{ fontSize: 24, fontWeight: 400, margin: "0 0 16px", color: colors.text }}>{children}</h1>
}

export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ fontSize: 12, fontWeight: 700, margin: "28px 0 10px", color: colors.muted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "Arial, sans-serif" }}>
      {children}
    </h2>
  )
}

export function Paragraph({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <p style={{ fontSize: 15, lineHeight: 1.6, margin: "0 0 12px", fontFamily: "Arial, sans-serif", ...style }}>{children}</p>
}

export function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "20px 0" }}>
      <tbody>
        <tr>
          <td style={{ backgroundColor: colors.accent, borderRadius: 8 }}>
            <a href={href} style={{ display: "inline-block", padding: "12px 24px", color: "#ffffff", textDecoration: "none", fontSize: 15, fontFamily: "Arial, sans-serif" }}>
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export interface EmailOrderItem {
  title: string
  dimensions: string | null
  imageUrl: string | null
  price: number
}

export function ItemsTable({ items }: { items: EmailOrderItem[] }) {
  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            <td width={64} style={{ padding: "8px 12px 8px 0", verticalAlign: "top" }}>
              {item.imageUrl && (
                <img src={item.imageUrl} alt="" width={56} height={70} style={{ display: "block", objectFit: "cover", borderRadius: 6 }} />
              )}
            </td>
            <td style={{ padding: "8px 0", verticalAlign: "top", fontFamily: "Arial, sans-serif" }}>
              <div style={{ fontSize: 15 }}>{item.title}</div>
              {item.dimensions && <div style={{ fontSize: 13, color: colors.muted }}>{item.dimensions}</div>}
            </td>
            <td style={{ padding: "8px 0", verticalAlign: "top", textAlign: "right", fontSize: 15, fontFamily: "Arial, sans-serif", whiteSpace: "nowrap" }}>
              {formatMoney(item.price)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function TotalsTable({ rows, total }: { rows: [string, string][]; total: string }) {
  const cell: CSSProperties = { padding: "4px 0", fontSize: 14, fontFamily: "Arial, sans-serif" }
  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderTop: `1px solid ${colors.border}`, marginTop: 8 }}>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td style={{ ...cell, color: colors.muted, paddingTop: 8 }}>{label}</td>
            <td style={{ ...cell, textAlign: "right", paddingTop: 8 }}>{value}</td>
          </tr>
        ))}
        <tr>
          <td style={{ ...cell, fontSize: 16, fontWeight: 700, paddingTop: 10 }}>Totaal (incl. btw)</td>
          <td style={{ ...cell, fontSize: 16, fontWeight: 700, paddingTop: 10, textAlign: "right" }}>{total}</td>
        </tr>
      </tbody>
    </table>
  )
}

export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div style={{ backgroundColor: colors.background, borderRadius: 8, padding: "14px 16px", margin: "16px 0", fontSize: 14, lineHeight: 1.6, fontFamily: "Arial, sans-serif" }}>
      {children}
    </div>
  )
}
