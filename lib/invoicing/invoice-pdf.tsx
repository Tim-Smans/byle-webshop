import "server-only"
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"
import { vatBreakdown } from "./invoice-lines"
import { VAT_EXEMPTION_NOTE } from "../shop/config"
import type { Invoice, InvoiceParty } from "./types"

const money = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" })
const date = new Intl.DateTimeFormat("nl-BE", { dateStyle: "long", timeZone: "Europe/Brussels" })

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Helvetica", color: "#3b2f25" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", textAlign: "right" },
  muted: { color: "#7a6a5c" },
  parties: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  party: { width: "45%" },
  label: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1, color: "#7a6a5c", marginBottom: 4 },
  meta: { flexDirection: "row", gap: 24, marginBottom: 24 },
  table: { borderTopWidth: 1, borderColor: "#d9cfc4" },
  row: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 1, borderColor: "#eee6dd" },
  headRow: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 1, borderColor: "#d9cfc4" },
  colDesc: { width: "46%" },
  colDescWide: { width: "74%" },
  exemption: { marginTop: 24, fontFamily: "Helvetica-Bold" },
  colQty: { width: "8%", textAlign: "right" },
  colVat: { width: "10%", textAlign: "right" },
  colExcl: { width: "18%", textAlign: "right" },
  colIncl: { width: "18%", textAlign: "right" },
  bold: { fontFamily: "Helvetica-Bold" },
  totals: { marginTop: 16, marginLeft: "auto", width: "45%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grandTotal: { flexDirection: "row", justifyContent: "space-between", paddingTop: 6, marginTop: 4, borderTopWidth: 1, borderColor: "#d9cfc4", fontSize: 12, fontFamily: "Helvetica-Bold" },
  note: { marginTop: 28, color: "#7a6a5c", lineHeight: 1.4 },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, fontSize: 8, color: "#7a6a5c", textAlign: "center" },
})

function Party({ party }: { party: InvoiceParty }) {
  return (
    <View>
      {party.companyName && <Text style={styles.bold}>{party.companyName}</Text>}
      <Text style={party.companyName ? undefined : styles.bold}>{party.name}</Text>
      {party.street && <Text>{party.street}</Text>}
      {(party.postalCode || party.city) && <Text>{[party.postalCode, party.city].filter(Boolean).join(" ")}</Text>}
      {party.country && <Text>{party.country}</Text>}
      {party.vatNumber && <Text>Btw: {party.vatNumber}</Text>}
      {party.enterpriseNumber && <Text>Ondernemingsnr.: {party.enterpriseNumber}</Text>}
      {party.email && <Text style={styles.muted}>{party.email}</Text>}
      {party.phone && <Text style={styles.muted}>{party.phone}</Text>}
    </View>
  )
}

function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const isCreditNote = invoice.type === "credit_note"
  // Based on the invoice itself, so invoices issued with VAT keep their layout
  const vatExempt = invoice.lines.every((line) => line.vatRate === 0)

  return (
    <Document title={`${isCreditNote ? "Creditnota" : "Factuur"} ${invoice.invoiceNumber}`} author="Art by Lé">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Art by Lé</Text>
            <Text style={styles.muted}>Handcrafted Art</Text>
          </View>
          <View>
            <Text style={styles.title}>{isCreditNote ? "CREDITNOTA" : "FACTUUR"}</Text>
            <Text style={{ textAlign: "right" }}>{invoice.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.parties}>
          <View style={styles.party}>
            <Text style={styles.label}>Van</Text>
            <Party party={invoice.seller} />
          </View>
          <View style={styles.party}>
            <Text style={styles.label}>Aan</Text>
            <Party party={invoice.buyer} />
          </View>
        </View>

        <View style={styles.meta}>
          <View>
            <Text style={styles.label}>{isCreditNote ? "Datum creditnota" : "Factuurdatum"}</Text>
            <Text>{date.format(new Date(invoice.issuedAt))}</Text>
          </View>
          <View>
            <Text style={styles.label}>Bestelnummer</Text>
            <Text>{invoice.orderNumber}</Text>
          </View>
          {invoice.creditedInvoiceNumber && (
            <View>
              <Text style={styles.label}>Betreft factuur</Text>
              <Text>{invoice.creditedInvoiceNumber}</Text>
            </View>
          )}
        </View>

        <View style={styles.table}>
          {vatExempt ? (
            <View style={styles.headRow}>
              <Text style={[styles.colDescWide, styles.label]}>Omschrijving</Text>
              <Text style={[styles.colQty, styles.label]}>Aantal</Text>
              <Text style={[styles.colIncl, styles.label]}>Bedrag</Text>
            </View>
          ) : (
            <View style={styles.headRow}>
              <Text style={[styles.colDesc, styles.label]}>Omschrijving</Text>
              <Text style={[styles.colQty, styles.label]}>Aantal</Text>
              <Text style={[styles.colVat, styles.label]}>Btw</Text>
              <Text style={[styles.colExcl, styles.label]}>Excl. btw</Text>
              <Text style={[styles.colIncl, styles.label]}>Incl. btw</Text>
            </View>
          )}
          {invoice.lines.map((line, index) =>
            vatExempt ? (
              <View key={index} style={styles.row} wrap={false}>
                <Text style={styles.colDescWide}>{line.description}</Text>
                <Text style={styles.colQty}>{line.quantity}</Text>
                <Text style={styles.colIncl}>{money.format(line.totalInclVat)}</Text>
              </View>
            ) : (
              <View key={index} style={styles.row} wrap={false}>
                <Text style={styles.colDesc}>{line.description}</Text>
                <Text style={styles.colQty}>{line.quantity}</Text>
                <Text style={styles.colVat}>{line.vatRate}%</Text>
                <Text style={styles.colExcl}>{money.format(line.totalExclVat)}</Text>
                <Text style={styles.colIncl}>{money.format(line.totalInclVat)}</Text>
              </View>
            )
          )}
        </View>

        <View style={styles.totals}>
          {!vatExempt && (
            <>
              <View style={styles.totalRow}>
                <Text>Totaal excl. btw</Text>
                <Text>{money.format(invoice.subtotalExclVat)}</Text>
              </View>
              {vatBreakdown(invoice.lines).map(({ rate, base, vat }) => (
                <View key={rate} style={styles.totalRow}>
                  <Text>Btw {rate}% op {money.format(base)}</Text>
                  <Text>{money.format(vat)}</Text>
                </View>
              ))}
            </>
          )}
          <View style={styles.grandTotal}>
            <Text>{isCreditNote ? "Te crediteren" : "Totaal"}</Text>
            <Text>{money.format(invoice.total)}</Text>
          </View>
        </View>

        {vatExempt && <Text style={styles.exemption}>{VAT_EXEMPTION_NOTE}</Text>}

        <Text style={styles.note}>
          {isCreditNote
            ? "Het bedrag van deze creditnota wordt terugbetaald via het oorspronkelijke betaalmiddel."
            : "Deze factuur werd volledig betaald via Mollie bij het plaatsen van de bestelling."}
        </Text>

        <Text style={styles.footer} fixed>
          {[
            invoice.seller.name,
            [invoice.seller.street, [invoice.seller.postalCode, invoice.seller.city].filter(Boolean).join(" ")]
              .filter(Boolean)
              .join(", "),
            invoice.seller.vatNumber && `Btw ${invoice.seller.vatNumber}`,
            invoice.seller.email,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      </Page>
    </Document>
  )
}

export async function renderInvoicePdf(invoice: Invoice): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument invoice={invoice} />)
}

export function invoiceFileName(invoice: Invoice): string {
  return `${invoice.type === "credit_note" ? "creditnota" : "factuur"}-${invoice.invoiceNumber}.pdf`
}
