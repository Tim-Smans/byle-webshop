import { isAdmin } from "@/lib/auth/admin-auth"
import { listInvoices } from "@/lib/invoicing/invoice-service"
import CreateMissingInvoicesButton from "@/components/admin/create-missing-invoices-button"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Download, FileText } from "lucide-react"

const dateFormatter = new Intl.DateTimeFormat("nl-BE", {
    dateStyle: "medium",
    timeZone: "Europe/Brussels",
})

export default async function InvoicesAdminPage() {
    const admin = await isAdmin()
    if (!admin) {
        redirect("/admin/login")
    }

    const invoices = await listInvoices()

    return (
        <div className="min-h-screen px-6 pt-28 pb-10 max-w-5xl mx-auto">
            <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
            >
                <ArrowLeft className="h-4 w-4" />
                Terug naar dashboard
            </Link>

            <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-primary mb-1">Facturen</h1>
                    <p className="text-muted-foreground text-sm max-w-xl">
                        Facturen worden automatisch aangemaakt zodra een bestelling betaald is.
                        Ze kunnen niet gewijzigd worden; een correctie of terugbetaling gebeurt met een creditnota.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <CreateMissingInvoicesButton />
                    {/* Plain link: the route handler responds with the xlsx as a download */}
                    <a
                        href="/api/admin/invoices/export"
                        download
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors"
                    >
                        <Download size={16} />
                        Exporteren naar Excel
                    </a>
                </div>
            </div>

            {invoices.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground text-sm">
                    <FileText size={20} className="mx-auto mb-3 opacity-60" />
                    Nog geen facturen
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                                <th className="px-4 py-3 font-semibold">Nummer</th>
                                <th className="px-4 py-3 font-semibold">Datum</th>
                                <th className="px-4 py-3 font-semibold">Klant</th>
                                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Bestelling</th>
                                <th className="px-4 py-3 font-semibold text-right">Totaal</th>
                                <th className="px-4 py-3 w-12" />
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="font-medium text-foreground">{invoice.invoiceNumber}</span>
                                        {invoice.type === "credit_note" && (
                                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-800">
                                                Creditnota
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                        {dateFormatter.format(new Date(invoice.issuedAt))}
                                    </td>
                                    <td className="px-4 py-3 text-foreground">
                                        {invoice.buyer.companyName ?? invoice.buyer.name}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                                        {invoice.orderNumber}
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">{formatPrice(invoice.total)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <a
                                            href={`/api/admin/invoices/${invoice.id}`}
                                            target="_blank"
                                            rel="noopener"
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label={`Download ${invoice.invoiceNumber}`}
                                        >
                                            <Download size={16} />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
