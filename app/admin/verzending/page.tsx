import { isAdmin } from "@/lib/auth/admin-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { mapShippingRate, type ShippingRate } from "@/lib/shop/shipping"
import ShippingRatesEditor from "@/components/admin/shipping-rates-editor"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

async function getShippingRates(): Promise<ShippingRate[]> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from("ShippingRate")
        .select("*")
        .order("countryName", { ascending: true })

    if (error) throw new Error(error.message)

    return (data ?? []).map(mapShippingRate)
}

export default async function ShippingAdminPage() {
    const admin = await isAdmin()
    if (!admin) {
        redirect("/admin/login")
    }

    const rates = await getShippingRates()

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
                <h1 className="text-3xl font-light tracking-tight text-primary mb-1">Verzending</h1>
                <p className="text-muted-foreground text-sm max-w-2xl">
                    Stel per land een prijs in voor kleine en grote werken (inclusief btw).
                    Per bestelling wordt één keer verzending aangerekend: het tarief van het grootste werk.
                    Landen die hier niet actief staan, kunnen niet gekozen worden bij het afrekenen.
                    Afhalen in Vlimmeren is altijd gratis.
                </p>
            </div>

            <ShippingRatesEditor rates={rates} />
        </div>
    )
}
