import { isAdmin } from "@/lib/auth/admin-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { normalizeDiscountPercent, type DiscountCode } from "@/lib/shop/discount"
import DiscountCodesManager from "@/components/admin/discounts/discount-codes-manager"
import SaleWorksList, { type SaleWork } from "@/components/admin/discounts/sale-works-list"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

// Orders that count as "the discount was really given"
const PAID_STATUSES = ["paid", "shipped", "delivered", "completed"]

async function getDiscountCodes(): Promise<DiscountCode[]> {
    const supabase = createAdminClient()

    const [{ data: codes, error }, { data: orders, error: ordersError }] = await Promise.all([
        supabase.from("DiscountCode").select("*").order("createdAt", { ascending: false }),
        supabase
            .from("Order")
            .select("discountCodeId, discountAmount, status")
            .not("discountCodeId", "is", null)
            .not("status", "in", "(expired,cancelled)"),
    ])
    if (error) throw new Error(error.message)
    if (ordersError) throw new Error(ordersError.message)

    const usage = new Map<string, { timesUsed: number; totalDiscount: number }>()
    for (const order of orders ?? []) {
        const entry = usage.get(order.discountCodeId) ?? { timesUsed: 0, totalDiscount: 0 }
        entry.timesUsed += 1
        if (PAID_STATUSES.includes(order.status)) entry.totalDiscount += Number(order.discountAmount)
        usage.set(order.discountCodeId, entry)
    }

    return (codes ?? []).map((row) => ({
        id: row.id,
        code: row.code,
        description: row.description,
        type: row.type,
        value: Number(row.value),
        minOrderAmount: row.minOrderAmount === null ? null : Number(row.minOrderAmount),
        maxUses: row.maxUses,
        validFrom: row.validFrom,
        validUntil: row.validUntil,
        excludeSaleItems: row.excludeSaleItems,
        isActive: row.isActive,
        createdAt: row.createdAt,
        timesUsed: usage.get(row.id)?.timesUsed ?? 0,
        totalDiscount: Math.round((usage.get(row.id)?.totalDiscount ?? 0) * 100) / 100,
    }))
}

async function getSaleWorks(): Promise<SaleWork[]> {
    const { data, error } = await createAdminClient()
        .from("ArtPiece")
        .select("id, title, price, discountPercent, status, isSold")
        .not("discountPercent", "is", null)
        .order("title", { ascending: true })
    if (error) throw new Error(error.message)

    return (data ?? []).flatMap((row) => {
        const discountPercent = normalizeDiscountPercent(row.discountPercent)
        if (!discountPercent) return []
        return [{
            id: row.id,
            title: row.title,
            price: Number(row.price),
            discountPercent,
            isSold: row.isSold || row.status === "sold",
        }]
    })
}

export default async function DiscountsAdminPage() {
    const admin = await isAdmin()
    if (!admin) {
        redirect("/admin/login")
    }

    const [codes, saleWorks] = await Promise.all([getDiscountCodes(), getSaleWorks()])
    // Belgian calendar day, to show whether a code is valid today
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels" }).format(new Date())

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
                <h1 className="text-3xl font-light tracking-tight text-primary mb-1">Kortingen</h1>
                <p className="text-muted-foreground text-sm max-w-2xl">
                    Kortingscodes vult de klant in bij het afrekenen. Ze gelden op de kunstwerken, nooit op de
                    verzendkosten. Een korting op één werk zet je in het formulier van dat werk (via
                    &quot;aanpassen&quot; in de galerie).
                </p>
            </div>

            <section className="mb-12">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                    Kortingscodes
                </h2>
                <DiscountCodesManager codes={codes} today={today} />
            </section>

            <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                    Werken in korting
                </h2>
                <SaleWorksList works={saleWorks} />
            </section>
        </div>
    )
}
