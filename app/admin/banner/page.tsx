import { isAdmin } from "@/lib/auth/admin-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { getBannerSettings, getUsableCodes, loadBanner, type CodeRow } from "@/lib/announcements/banner"
import { normalizeBannerTheme } from "@/lib/announcements/types"
import { describeDiscount } from "@/lib/shop/discount"
import { isoToBrusselsLocal } from "@/lib/shop/brussels-time"
import BannerManager, { type AdminAnnouncement, type CodeOption } from "@/components/admin/banner/banner-manager"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

const dateTimeFormatter = new Intl.DateTimeFormat("nl-BE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Brussels",
})

async function getAnnouncements(): Promise<{ announcements: AdminAnnouncement[]; codes: CodeOption[] }> {
    const supabase = createAdminClient()

    const [{ data: rows, error }, { data: codeRows, error: codesError }] = await Promise.all([
        supabase
            .from("Announcement")
            .select("*")
            .order("sortOrder", { ascending: true })
            .order("createdAt", { ascending: true }),
        supabase
            .from("DiscountCode")
            .select("id, code, type, value, isActive, validFrom, validUntil, maxUses")
            .order("createdAt", { ascending: false }),
    ])
    if (error) throw new Error(error.message)
    if (codesError) throw new Error(codesError.message)

    const codes = (codeRows ?? []) as CodeRow[]
    const usable = await getUsableCodes(codes)
    const codeById = new Map(codes.map((code) => [code.id, code]))
    const now = Date.now()

    const announcements = (rows ?? []).map((row): AdminAnnouncement => {
        const code = row.discountCodeId ? codeById.get(row.discountCodeId) ?? null : null

        let status: AdminAnnouncement["status"]
        if (!row.isActive) status = { label: "Uit", tone: "muted" }
        else if (row.startsAt && new Date(row.startsAt).getTime() > now)
            status = { label: `Gepland vanaf ${dateTimeFormatter.format(new Date(row.startsAt))}`, tone: "planned" }
        else if (row.endsAt && new Date(row.endsAt).getTime() <= now) status = { label: "Afgelopen", tone: "muted" }
        else if (code && !usable.has(code.id)) status = { label: "Verborgen: code niet bruikbaar", tone: "warning" }
        else status = { label: "Zichtbaar", tone: "live" }

        return {
            id: row.id,
            message: row.message,
            linkUrl: row.linkUrl ?? "",
            linkLabel: row.linkLabel ?? "",
            discountCodeId: row.discountCodeId,
            code: code?.code ?? null,
            codeLabel: code ? `-${describeDiscount(code.type, Number(code.value))}` : null,
            theme: normalizeBannerTheme(row.theme),
            showCountdown: row.showCountdown,
            startsAt: row.startsAt ? isoToBrusselsLocal(row.startsAt) : "",
            endsAt: row.endsAt ? isoToBrusselsLocal(row.endsAt) : "",
            endsAtIso: row.endsAt,
            isActive: row.isActive,
            status,
        }
    })

    return {
        announcements,
        codes: codes.map((code) => ({
            id: code.id,
            code: code.code,
            label: `-${describeDiscount(code.type, Number(code.value))}`,
            usable: usable.has(code.id),
            validUntil: code.validUntil,
        })),
    }
}

export default async function BannerAdminPage() {
    const admin = await isAdmin()
    if (!admin) {
        redirect("/admin/login")
    }

    const [settings, { announcements, codes }, current] = await Promise.all([
        getBannerSettings(),
        getAnnouncements(),
        loadBanner({ ignoreSwitch: true }),
    ])

    return (
        <div className="min-h-screen px-6 pt-28 pb-10 max-w-5xl mx-auto">
            <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
            >
                <ArrowLeft className="h-4 w-4" />
                Terug naar dashboard
            </Link>

            <div className="mb-10">
                <h1 className="text-3xl font-light tracking-tight text-primary mb-1">Banner</h1>
                <p className="text-muted-foreground text-sm max-w-2xl">
                    Een balk onder het menu, op elke pagina. Heb je meerdere berichten, dan wisselen ze elkaar
                    af. Koppel je een kortingscode, dan kan de klant die met één klik kopiëren en wordt ze bij het
                    afrekenen vanzelf toegepast.
                </p>
            </div>

            <BannerManager
                enabled={settings.enabled}
                announcements={announcements}
                codes={codes}
                current={current}
            />
        </div>
    )
}
