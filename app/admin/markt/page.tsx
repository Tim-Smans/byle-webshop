import { isAdmin } from "@/lib/auth/admin-auth"
import { getTerminalInfo, type TerminalInfo } from "@/lib/mollie/terminal"
import StatusPill from "@/components/admin/mollie/status-pill"
import TerminalPaymentForm from "@/components/admin/markt/terminal-payment-form"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

const TERMINAL_STATUS = {
    active: { label: "Actief", tone: "good" },
    pending: { label: "Nog niet geactiveerd", tone: "progress" },
    inactive: { label: "Inactief", tone: "bad" },
} as const

export default async function MarktPage() {
    const admin = await isAdmin()
    if (!admin) {
        redirect("/admin/login")
    }

    let terminal: TerminalInfo | null = null
    let loadError: string | null = null
    try {
        terminal = await getTerminalInfo()
    } catch (err) {
        console.error("[markt]", err)
        loadError = err instanceof Error ? err.message : "Onbekende fout"
    }

    const status = terminal ? TERMINAL_STATUS[terminal.status as keyof typeof TERMINAL_STATUS] : undefined

    return (
        <div className="min-h-screen px-6 pt-28 pb-16 max-w-lg mx-auto">
            <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
            >
                <ArrowLeft className="h-4 w-4" />
                Terug naar dashboard
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-light tracking-tight text-primary mb-1">Markt</h1>
                <p className="text-muted-foreground text-sm">Stuur een bedrag naar de betaalterminal of de Tap to Pay-app.</p>
            </div>

            {loadError || !terminal ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-900">
                    <p className="font-medium mb-1">De terminal kon niet geladen worden.</p>
                    <p>{loadError}</p>
                    <p className="mt-2">
                        Kijk na of <code>MOLLIE_TERMINAL_ID</code> ingesteld is en bij dezelfde modus (test of live) hoort als{" "}
                        <code>MOLLIE_API_KEY</code>.
                    </p>
                </div>
            ) : (
                <>
                    <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm">
                        <div className="min-w-0">
                            <p className="font-medium truncate">{terminal.description}</p>
                            <p className="text-xs text-muted-foreground truncate">
                                {[terminal.brand, terminal.model].filter(Boolean).join(" ")} · <span className="font-mono">{terminal.id}</span>
                            </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            {terminal.mode === "test" && <StatusPill label="Testmodus" tone="progress" />}
                            <StatusPill label={status?.label ?? terminal.status} tone={status?.tone ?? "neutral"} />
                        </div>
                    </div>

                    <TerminalPaymentForm />
                </>
            )}
        </div>
    )
}
