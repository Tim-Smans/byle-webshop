import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/admin-auth";
import { getInvoice } from "@/lib/invoicing/invoice-service";
import { invoiceFileName, renderInvoicePdf } from "@/lib/invoicing/invoice-pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const authorized = await isAdmin();
    if (!authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const invoice = await getInvoice(id);
    if (!invoice) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const pdf = await renderInvoicePdf(invoice);

    return new Response(new Uint8Array(pdf), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${invoiceFileName(invoice)}"`,
            "Cache-Control": "no-store",
        },
    });
}
