import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/admin-auth";
import { listInvoices } from "@/lib/invoicing/invoice-service";

// Export for the accountant: one row per invoice / credit note
export const GET = async () => {
    const authorized = await isAdmin()
    if (!authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invoices = await listInvoices()

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet("Facturen")

    sheet.columns = [
        { header: "Nummer", key: "invoiceNumber", width: 14 },
        { header: "Type", key: "type", width: 12 },
        { header: "Datum", key: "issuedAt", width: 14, style: { numFmt: "dd/mm/yyyy" } },
        { header: "Bestelling", key: "orderNumber", width: 16 },
        { header: "Betreft factuur", key: "credited", width: 16 },
        { header: "Klant", key: "customer", width: 28 },
        { header: "Bedrijf", key: "company", width: 24 },
        { header: "Btw-nummer klant", key: "vatNumber", width: 18 },
        { header: "Excl. btw", key: "excl", width: 12, style: { numFmt: "€ #,##0.00" } },
        { header: "Btw", key: "vat", width: 12, style: { numFmt: "€ #,##0.00" } },
        { header: "Totaal", key: "total", width: 12, style: { numFmt: "€ #,##0.00" } },
    ]
    sheet.getRow(1).font = { bold: true }

    // Oldest first, as in a sales journal
    for (const invoice of [...invoices].reverse()) {
        sheet.addRow({
            invoiceNumber: invoice.invoiceNumber,
            type: invoice.type === "credit_note" ? "Creditnota" : "Factuur",
            issuedAt: new Date(invoice.issuedAt),
            orderNumber: invoice.orderNumber,
            credited: invoice.creditedInvoiceNumber ?? "",
            customer: invoice.buyer.name,
            company: invoice.buyer.companyName ?? "",
            vatNumber: invoice.buyer.vatNumber ?? "",
            excl: invoice.subtotalExclVat,
            vat: invoice.vatAmount,
            total: invoice.total,
        })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const date = new Date().toISOString().split("T")[0]

    return new Response(buffer, {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="facturen-${date}.xlsx"`,
            "Cache-Control": "no-store",
        },
    })
}
