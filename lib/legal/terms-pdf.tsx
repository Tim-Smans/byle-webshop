import "server-only"
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"
import { TERMS_INTRO, TERMS_SECTIONS, type TermsInline } from "./terms"
import { getSiteUrl, TERMS_LAST_UPDATED } from "../shop/config"

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 52, fontSize: 10, fontFamily: "Helvetica", lineHeight: 1.45, color: "#3b2f25" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  updated: { color: "#7a6a5c", marginBottom: 16 },
  intro: { marginBottom: 12 },
  section: { marginTop: 10 },
  heading: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  paragraph: { marginBottom: 5 },
  box: { marginVertical: 4, padding: 8, backgroundColor: "#f7efe2" },
})

// Links become plain text with the full address, readable on paper too
function toText(content: TermsInline[]): string {
  const site = getSiteUrl()
  return content
    .map((part) => (typeof part === "string" ? part : `${part.text} (${site}${part.href})`))
    .join("")
}

function TermsDocument() {
  return (
    <Document title="Algemene voorwaarden Art by Lé" author="Art by Lé">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Algemene voorwaarden – Art by Lé</Text>
        <Text style={styles.updated}>Laatst bijgewerkt: {TERMS_LAST_UPDATED}</Text>
        <Text style={styles.intro}>{TERMS_INTRO}</Text>

        {TERMS_SECTIONS.map((section) => (
          // Sections are short: keep each one together on a page
          <View key={section.title} style={styles.section} wrap={false}>
            <Text style={styles.heading}>{section.title}</Text>
            {section.blocks.map((block, index) =>
              block.kind === "box" ? (
                <View key={index} style={styles.box} wrap={false}>
                  {block.lines.map((line) => (
                    <Text key={line}>{line}</Text>
                  ))}
                </View>
              ) : (
                <Text key={index} style={styles.paragraph}>{toText(block.content)}</Text>
              )
            )}
          </View>
        ))}
      </Page>
    </Document>
  )
}

export async function renderTermsPdf(): Promise<Buffer> {
  return renderToBuffer(<TermsDocument />)
}

export const TERMS_PDF_FILENAME = "algemene-voorwaarden-art-by-le.pdf"
