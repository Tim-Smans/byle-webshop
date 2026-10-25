import { getOrderForCustomer } from "@/lib/orders/order-queries";
import { getInvoicesForOrder } from "@/lib/invoicing/invoice-service";
import { invoiceFileName, renderInvoicePdf } from "@/lib/invoicing/invoice-pdf";

// Customer download: /bestelling/{orderNumber}/factuur?t={token}[&id={invoiceId}]
// Without id the regular invoice is returned; with id a credit note of the
// same order can be downloaded.
export async function GET(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
    const { orderNumber } = await params;
    const url = new URL(request.url);
    const token = url.searchParams.get("t") ?? "";
    const invoiceId = url.searchParams.get("id");

    const order = await getOrderForCustomer(orderNumber, token);
    if (!order) {
        return new Response("Not found", { status: 404 });
    }

    const invoices = await getInvoicesForOrder(order.id);
    const invoice = invoiceId
        ? invoices.find((row) => row.id === invoiceId)
        : invoices.find((row) => row.type === "invoice");
    if (!invoice) {
        return new Response("Not found", { status: 404 });
    }

    const pdf = await renderInvoicePdf(invoice);

    return new Response(new Uint8Array(pdf), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${invoiceFileName(invoice)}"`,
            "Cache-Control": "private, no-store",
        },
    });
}
