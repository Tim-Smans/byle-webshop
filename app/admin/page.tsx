import { isAdmin } from "@/lib/auth/admin-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { redirect } from "next/navigation"
import LogoutButton from "@/components/admin/logout-button"
import MoveSoldButton from "@/components/admin/move-sold-button"
import {
    ImageIcon,
    Layers,
    Tag,
    PaintbrushIcon,
    CheckCircle2,
    Circle,
    Star,
    HardDrive,
    Plus,
    ArrowRight,
    MoveRight,
    TrendingUp,
    Users,
    Eye,
    Mail,
} from "lucide-react"

async function getDashboardStats() {
    const supabase = createAdminClient()

    const [
        { count: totalArtPieces },
        { count: soldArtPieces },
        { count: featuredArtPieces },
        { count: totalCollections },
        { count: totalImages },
        { count: totalLabels },
        { data: storageFiles },
    ] = await Promise.all([
        supabase.from("ArtPiece").select("*", { count: "exact", head: true }),
        supabase.from("ArtPiece").select("*", { count: "exact", head: true }).eq("isSold", true),
        supabase.from("ArtPiece").select("*", { count: "exact", head: true }).eq("isFeatured", true),
        supabase.from("Collection").select("*", { count: "exact", head: true }),
        supabase.from("Image").select("*", { count: "exact", head: true }),
        supabase.from("Label").select("*", { count: "exact", head: true }),
        supabase.storage.from("images").list("", { limit: 10000 }),
    ])

    const storageSize = storageFiles?.reduce((acc, file) => acc + (file.metadata?.size ?? 0), 0) ?? 0
    const storageFileCount = storageFiles?.length ?? 0

    return {
        totalArtPieces: totalArtPieces ?? 0,
        soldArtPieces: soldArtPieces ?? 0,
        availableArtPieces: (totalArtPieces ?? 0) - (soldArtPieces ?? 0),
        featuredArtPieces: featuredArtPieces ?? 0,
        totalCollections: totalCollections ?? 0,
        totalImages: totalImages ?? 0,
        totalLabels: totalLabels ?? 0,
        storageSize,
        storageFileCount,
    }
}

type AnalyticsStats = {
    pageviews: number
    visitors: number
    topRoutes: { route: string; pageviews: number; visitors: number }[]
} | null

async function getAnalyticsStats(): Promise<AnalyticsStats> {
    const apiKey = process.env.VERCEL_API_KEY
    const projectId = process.env.VERCEL_PROJECT_ID
    if (!apiKey || !projectId) return null

    const headers = { Authorization: `Bearer ${apiKey}` }
    const teamId = process.env.VERCEL_TEAM_ID

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const until = new Date().toISOString().split("T")[0]

    const base = new URLSearchParams({ projectId, since, until })
    if (teamId) base.set("teamId", teamId)

    const dailyParams = new URLSearchParams(base)
    dailyParams.set("by", "day")

    const routeParams = new URLSearchParams(base)
    routeParams.set("by", "route")
    routeParams.set("limit", "5")

    const baseUrl = "https://api.vercel.com/v1/query/web-analytics"

    console.log("[analytics] full daily URL:", `${baseUrl}/visits/aggregate?${dailyParams}`)
    console.log("[analytics] teamId in request:", teamId ?? "(not set — may be required)")

    const [dailyResult, routeResult] = await Promise.allSettled([
        fetch(`${baseUrl}/visits/aggregate?${dailyParams}`, { headers }).then(async (r) => {
            const body = await r.json()
            console.log("[analytics] daily:", r.status, JSON.stringify(body).slice(0, 400))
            if (!r.ok) throw new Error(body?.error?.message ?? r.statusText)
            return body
        }),
        fetch(`${baseUrl}/visits/aggregate?${routeParams}`, { headers }).then(async (r) => {
            const body = await r.json()
            if (!r.ok) throw new Error(body?.error?.message ?? r.statusText)
            return body
        }),
    ])

    if (dailyResult.status === "rejected" || routeResult.status === "rejected") return null

    const dailyData: { pageviews: number; visitors: number }[] = dailyResult.value?.data ?? []
    const routeData: { route: string; pageviews: number; visitors: number }[] = routeResult.value?.data ?? []

    const pageviews = dailyData.reduce((sum, d) => sum + (d.pageviews ?? 0), 0)
    const visitors = dailyData.reduce((sum, d) => sum + (d.visitors ?? 0), 0)

    return { pageviews, visitors, topRoutes: routeData }
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]} / 100 GB`
}

export default async function AdminDashboard() {
    const admin = await isAdmin()
    if (!admin) {
        redirect("/admin/login")
    }

    const [stats, analytics] = await Promise.all([getDashboardStats(), getAnalyticsStats()])

    return (
        <div className="min-h-screen px-6 pt-28 pb-10 max-w-5xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-light tracking-tight text-primary mb-1">Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm">Overzicht van de galerij en beheeropties</p>
            </div>

            {/* Artpieces stats */}
            <section className="mb-10">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Kunstwerken</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Totaal"
                        value={stats.totalArtPieces}
                        icon={<PaintbrushIcon size={18} />}
                    />
                    <StatCard
                        label="Beschikbaar"
                        value={stats.availableArtPieces}
                        icon={<Circle size={18} />}
                        accent="green"
                    />
                    <StatCard
                        label="Verkocht"
                        value={stats.soldArtPieces}
                        icon={<CheckCircle2 size={18} />}
                        accent="red"
                    />
                    <StatCard
                        label="Uitgelicht"
                        value={stats.featuredArtPieces}
                        icon={<Star size={18} />}
                        accent="amber"
                    />
                </div>
            </section>

            {/* Library stats */}
            <section className="mb-10">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Bibliotheek</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Collecties"
                        value={stats.totalCollections}
                        icon={<Layers size={18} />}
                    />
                    <StatCard
                        label="Afbeeldingen (DB)"
                        value={stats.totalImages}
                        icon={<ImageIcon size={18} />}
                    />
                    <StatCard
                        label="Labels"
                        value={stats.totalLabels}
                        icon={<Tag size={18} />}
                    />
                    <StatCard
                        label="Bestanden (Storage)"
                        value={stats.storageFileCount}
                        icon={<HardDrive size={18} />}
                        subtitle={stats.storageSize > 0 ? formatBytes(stats.storageSize) : undefined}
                    />
                </div>
            </section>

            {/* Analytics */}
            {analytics && (
                <section className="mb-10">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                        Analytics (laatste 30 dagen)
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <StatCard label="Paginaweergaven" value={analytics.pageviews} icon={<Eye size={18} />} />
                        <StatCard label="Unieke bezoekers" value={analytics.visitors} icon={<Users size={18} />} />
                    </div>
                    {analytics.topRoutes.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={16} className="text-muted-foreground" />
                                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Top pagina&apos;s
                                </span>
                            </div>
                            <div className="space-y-3">
                                {analytics.topRoutes.map((row) => {
                                    const max = analytics.topRoutes[0].pageviews
                                    const pct = max > 0 ? Math.round((row.pageviews / max) * 100) : 0
                                    return (
                                        <div key={row.route}>
                                            <div className="flex items-center justify-between mb-1 gap-2">
                                                <span className="text-sm text-foreground font-mono truncate">{row.route}</span>
                                                <span className="text-xs text-muted-foreground shrink-0">
                                                    {row.pageviews} views · {row.visitors} bezoekers
                                                </span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-border overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-primary/60"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Quick actions */}
            <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Beheer</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AdminLink
                        href="/admin/artpiece/create"
                        title="Nieuw kunstwerk toevoegen"
                        description="Upload afbeeldingen, stel prijs in en voeg labels toe"
                        icon={<Plus size={20} />}
                        primary
                    />
                    <AdminLink
                        href="/gallery"
                        title="Galerij bekijken"
                        description="Beheer bestaande werken: bewerk, verkoop of verwijder"
                        icon={<PaintbrushIcon size={20} />}
                    />
                    <AdminLink
                        href="/admin/newsletter"
                        title="Nieuwsbrief"
                        description="Bekijk inschrijvingen en exporteer ze naar Excel"
                        icon={<Mail size={20} />}
                    />
                    <AdminLink
                        href="/admin/migrate-images"
                        title="Afbeeldingen migreren"
                        description="Zet bestaande afbeeldingen om naar geoptimaliseerd formaat"
                        icon={<MoveRight size={20} />}
                    />
                    <MoveSoldButton />
                    <LogoutButton />
                </div>
            </section>
        </div>
    )
}

function StatCard({
    label,
    value,
    icon,
    accent,
    subtitle,
}: {
    label: string
    value: number
    icon: React.ReactNode
    accent?: "green" | "red" | "amber"
    subtitle?: string
}) {
    const accentMap: Record<string, string> = {
        green: "text-emerald-700",
        red: "text-red-700",
        amber: "text-amber-700",
    }
    const accentClass = (accent ? accentMap[accent] : undefined) ?? "text-primary"

    return (
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
            <div className={`${accentClass} opacity-70`}>{icon}</div>
            <div className={`text-2xl font-light ${accentClass}`}>{value}</div>
            <div className="text-xs text-muted-foreground leading-tight">{label}</div>
            {subtitle && <div className="text-xs text-muted-foreground font-medium">{subtitle}</div>}
        </div>
    )
}

function AdminLink({
    href,
    title,
    description,
    icon,
    primary,
}: {
    href: string
    title: string
    description: string
    icon: React.ReactNode
    primary?: boolean
}) {
    return (
        <Link
            href={href}
            className={`group flex items-start gap-4 rounded-lg border p-5 transition-colors ${
                primary
                    ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                    : "border-border hover:bg-card"
            }`}
        >
            <div className={`mt-0.5 shrink-0 ${primary ? "text-primary" : "text-muted-foreground"}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${primary ? "text-primary" : "text-foreground"}`}>
                    {title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
            </div>
            <ArrowRight
                size={16}
                className={`shrink-0 mt-0.5 transition-transform group-hover:translate-x-1 ${
                    primary ? "text-primary" : "text-muted-foreground"
                }`}
            />
        </Link>
    )
}
