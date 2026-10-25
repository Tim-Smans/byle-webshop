import { renderWithdrawalFormPdf, WITHDRAWAL_FORM_FILENAME } from "@/lib/legal/withdrawal-form-pdf";

export async function GET() {
    const pdf = await renderWithdrawalFormPdf();

    return new Response(new Uint8Array(pdf), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${WITHDRAWAL_FORM_FILENAME}"`,
            "Cache-Control": "public, max-age=3600",
        },
    });
}
