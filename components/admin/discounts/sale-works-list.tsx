"use client"

import Link from "next/link"
import { FC, useState } from "react"
import { Loader2, Percent } from "lucide-react"
import { useFeedback } from "@/lib/context/feedback-context"
import { getSalePrice } from "@/lib/shop/discount"
import { formatPrice } from "@/lib/utils"
import { setArtPieceDiscount } from "@/app/admin/artpiece/actions"

export interface SaleWork {
    id: string
    title: string
    price: number
    discountPercent: number
    isSold: boolean
}

const SaleWorksList: FC<{ works: SaleWork[] }> = ({ works }) => {
    if (works.length === 0) {
        return (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
                <Percent size={20} className="mx-auto mb-3 opacity-60" />
                Er staan geen werken in korting. Open een werk via <strong>aanpassen</strong> en zet de schakelaar
                bij <strong>Korting</strong> aan.
            </div>
        )
    }

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <ul className="divide-y divide-border">
                {works.map((work) => (
                    <SaleWorkRow key={work.id} work={work} />
                ))}
            </ul>
        </div>
    )
}

const SaleWorkRow: FC<{ work: SaleWork }> = ({ work }) => {
    const { showError } = useFeedback()
    const [isSaving, setIsSaving] = useState(false)

    const stopSale = async () => {
        setIsSaving(true)
        try {
            await setArtPieceDiscount(work.id, null)
        } catch (err) {
            showError(err instanceof Error ? err.message : "Opslaan mislukt")
            setIsSaving(false)
        }
    }

    return (
        <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
            <div className="flex-1 min-w-[160px]">
                <Link href={`/art/${work.id}`} className="font-medium hover:underline underline-offset-4">
                    {work.title}
                </Link>
                {work.isSold && <span className="ml-2 text-xs text-muted-foreground">verkocht</span>}
            </div>
            <div className="whitespace-nowrap">
                <s className="text-muted-foreground mr-2">{formatPrice(work.price)}</s>
                <span className="text-red-800 font-medium">{formatPrice(getSalePrice(work.price, work.discountPercent))}</span>
                <span className="ml-2 text-xs text-muted-foreground">-{work.discountPercent}%</span>
            </div>
            <div className="flex items-center gap-3">
                <Link href={`/admin/artpiece/${work.id}`} className="text-muted-foreground hover:text-foreground underline underline-offset-4">
                    Aanpassen
                </Link>
                <button
                    onClick={stopSale}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-red-700 underline underline-offset-4 disabled:opacity-50"
                >
                    {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                    Korting stoppen
                </button>
            </div>
        </li>
    )
}

export default SaleWorksList
