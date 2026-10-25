import { renderTermsPdf, TERMS_PDF_FILENAME } from "@/lib/legal/terms-pdf";

export async function GET() {
    const pdf = await renderTermsPdf();

    return new Response(new Uint8Array(pdf), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${TERMS_PDF_FILENAME}"`,
            "Cache-Control": "public, max-age=3600",
        },
    });
}
