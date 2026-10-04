import { isAdmin } from "@/lib/auth/admin-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import DeleteSubscriberButton from "@/components/admin/delete-subscriber-button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Download, Mail } from "lucide-react"

type NewsletterSubscriber = {
    id: string
    email: string
    createdAt: string
}

async function getSubscribers(): Promise<NewsletterSubscriber[]> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from("NewsletterSubscriber")
        .select("id, email, createdAt")
        .order("createdAt", { ascending: false })

    if (error) throw new Error(error.message)

    return data ?? []
}

const dateFormatter = new Intl.DateTimeFormat("nl-BE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Brussels",
})

export default async function NewsletterAdminPage() {
    const admin = await isAdmin()
    if (!admin) {
        redirect("/admin/login")
    }

    const subscribers = await getSubscribers()

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
                    <h1 className="text-3xl font-light tracking-tight text-primary mb-1">Nieuwsbrief</h1>
                    <p className="text-muted-foreground text-sm">
                        {subscribers.length} inschrijving{subscribers.length === 1 ? "" : "en"}
                    </p>
                </div>

                {/* Plain link: the route handler responds with the xlsx as a download */}
                <a
                    href="/api/admin/newsletter/export"
                    download
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors"
                >
                    <Download size={16} />
                    Exporteren naar Excel
                </a>
            </div>

            {subscribers.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground text-sm">
                    <Mail size={20} className="mx-auto mb-3 opacity-60" />
                    Nog geen inschrijvingen
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                                <th className="px-4 py-3 font-semibold">E-mail</th>
                                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Ingeschreven op</th>
                                <th className="px-4 py-3 w-12" />
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((subscriber) => (
                                <tr key={subscriber.id} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3 text-foreground break-all">{subscriber.email}</td>
                                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                                        {dateFormatter.format(new Date(subscriber.createdAt))}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <DeleteSubscriberButton id={subscriber.id} email={subscriber.email} />
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
