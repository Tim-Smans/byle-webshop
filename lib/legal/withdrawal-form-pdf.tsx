import "server-only"
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"
import { WITHDRAWAL_FORM } from "./withdrawal-form"

const styles = StyleSheet.create({
  page: { padding: 56, fontSize: 11, fontFamily: "Helvetica", lineHeight: 1.5, color: "#222222" },
  title: { fontSize: 15, fontFamily: "Helvetica-Bold", marginBottom: 12 },
  paragraph: { marginBottom: 10 },
  field: { marginTop: 8 },
  dots: { color: "#888888" },
})

const DOTS = ".".repeat(95)

function WithdrawalFormDocument() {
  return (
    <Document title="Modelformulier voor herroeping" author={WITHDRAWAL_FORM.recipient[0]}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{WITHDRAWAL_FORM.title}</Text>
        <Text style={styles.paragraph}>{WITHDRAWAL_FORM.intro}</Text>

        <Text>Aan:</Text>
        <View style={styles.paragraph}>
          {WITHDRAWAL_FORM.recipient.map((line) => (
            <Text key={line}>{line}</Text>
          ))}
        </View>

        <Text style={styles.paragraph}>{WITHDRAWAL_FORM.statement}</Text>

        {WITHDRAWAL_FORM.fields.map((field) => (
          <View key={field.label} style={styles.field} wrap={false}>
            <Text>{field.label}</Text>
            {field.note && <Text>{field.note}</Text>}
            {Array.from({ length: field.lines }, (_, index) => (
              <Text key={index} style={styles.dots}>{DOTS}</Text>
            ))}
          </View>
        ))}

        <Text style={{ marginTop: 16 }}>{WITHDRAWAL_FORM.footnote}</Text>
      </Page>
    </Document>
  )
}

export async function renderWithdrawalFormPdf(): Promise<Buffer> {
  return renderToBuffer(<WithdrawalFormDocument />)
}

export const WITHDRAWAL_FORM_FILENAME = "modelformulier-herroeping-art-by-le.pdf"
