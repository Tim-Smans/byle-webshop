"use client"

import { FC, useState } from "react"
import { Loader2, Plus, Trash2, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFeedback } from "@/lib/context/feedback-context"
import { SHIPPING_COUNTRIES } from "@/lib/shop/countries"
import type { ShippingRate } from "@/lib/shop/shipping"
import { deleteShippingRate, saveShippingRate } from "@/app/admin/verzending/actions"

// Accepts both "12,50" and "12.50"
function parsePrice(value: string): number {
    return Number(value.trim().replace(",", "."))
}

function formatInput(value: number): string {
    return value.toFixed(2).replace(".", ",")
}

const ShippingRatesEditor: FC<{ rates: ShippingRate[] }> = ({ rates }) => {
    const usedCodes = new Set(rates.map((rate) => rate.countryCode))
    const availableCountries = SHIPPING_COUNTRIES.filter((country) => !usedCodes.has(country.code))

    return (
        <div className="space-y-8">
            {rates.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground text-sm">
                    <Truck size={20} className="mx-auto mb-3 opacity-60" />
                    Nog geen landen ingesteld. Voeg hieronder je eerste land toe, bijvoorbeeld België.
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                                <th className="px-4 py-3 font-semibold">Land</th>
                                <th className="px-4 py-3 font-semibold">Klein werk</th>
                                <th className="px-4 py-3 font-semibold">Groot werk</th>
                                <th className="px-4 py-3 font-semibold">Actief</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {rates.map((rate) => (
                                // Remount when the saved values change, so the inputs reset
                                <RateRow
                                    key={`${rate.id}-${rate.priceSmall}-${rate.priceLarge}-${rate.isActive}`}
                                    rate={rate}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {availableCountries.length > 0 && <AddRateForm countries={availableCountries} />}
        </div>
    )
}

const RateRow: FC<{ rate: ShippingRate }> = ({ rate }) => {
    const { showError, showWarning } = useFeedback()
    const [priceSmall, setPriceSmall] = useState(formatInput(rate.priceSmall))
    const [priceLarge, setPriceLarge] = useState(formatInput(rate.priceLarge))
    const [isSaving, setIsSaving] = useState(false)

    const isDirty =
        parsePrice(priceSmall) !== rate.priceSmall || parsePrice(priceLarge) !== rate.priceLarge

    const save = async (isActive: boolean) => {
        setIsSaving(true)
        try {
            await saveShippingRate({
                countryCode: rate.countryCode,
                priceSmall: parsePrice(priceSmall),
                priceLarge: parsePrice(priceLarge),
                isActive,
            })
        } catch (err) {
            showError(err instanceof Error ? err.message : "Opslaan mislukt")
            setIsSaving(false)
        }
    }

    const remove = async () => {
        setIsSaving(true)
        try {
            await deleteShippingRate(rate.id)
        } catch (err) {
            showError(err instanceof Error ? err.message : "Verwijderen mislukt")
            setIsSaving(false)
        }
    }

    return (
        <tr className="border-b border-border last:border-0">
            <td className="px-4 py-3 text-foreground whitespace-nowrap">{rate.countryName}</td>
            <td className="px-4 py-3">
                <PriceInput value={priceSmall} onChange={setPriceSmall} disabled={isSaving} />
            </td>
            <td className="px-4 py-3">
                <PriceInput value={priceLarge} onChange={setPriceLarge} disabled={isSaving} />
            </td>
            <td className="px-4 py-3">
                <button
                    role="switch"
                    aria-checked={rate.isActive}
                    aria-label={`${rate.countryName} actief`}
                    disabled={isSaving}
                    onClick={() => save(!rate.isActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${rate.isActive ? "bg-emerald-600" : "bg-border"}`}
                >
                    <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${rate.isActive ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                </button>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                    {isDirty && (
                        <Button size="sm" onClick={() => save(rate.isActive)} disabled={isSaving}>
                            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                            Opslaan
                        </Button>
                    )}
                    <button
                        onClick={() => showWarning(`${rate.countryName} verwijderen uit de verzendlanden?`, remove)}
                        disabled={isSaving}
                        className="text-muted-foreground hover:text-red-700 transition-colors disabled:opacity-50"
                        aria-label={`${rate.countryName} verwijderen`}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    )
}

const AddRateForm: FC<{ countries: { code: string; name: string }[] }> = ({ countries }) => {
    const { showError } = useFeedback()
    const [countryCode, setCountryCode] = useState(countries[0].code)
    const [priceSmall, setPriceSmall] = useState("")
    const [priceLarge, setPriceLarge] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    // The selected country may just have been added; fall back to the first free one
    const selectedCode = countries.some((c) => c.code === countryCode) ? countryCode : countries[0].code

    const add = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!priceSmall.trim() || !priceLarge.trim()) {
            showError("Vul een prijs in voor kleine én grote werken.")
            return
        }

        setIsSaving(true)
        try {
            await saveShippingRate({
                countryCode: selectedCode,
                priceSmall: parsePrice(priceSmall),
                priceLarge: parsePrice(priceLarge),
                isActive: true,
            })
            setPriceSmall("")
            setPriceLarge("")
        } catch (err) {
            showError(err instanceof Error ? err.message : "Toevoegen mislukt")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form onSubmit={add} className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Land toevoegen
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_140px_auto] gap-3 items-end">
                <label className="text-sm">
                    <span className="block text-muted-foreground mb-1">Land</span>
                    <select
                        value={selectedCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-sm">
                    <span className="block text-muted-foreground mb-1">Klein werk</span>
                    <PriceInput value={priceSmall} onChange={setPriceSmall} disabled={isSaving} />
                </label>
                <label className="text-sm">
                    <span className="block text-muted-foreground mb-1">Groot werk</span>
                    <PriceInput value={priceLarge} onChange={setPriceLarge} disabled={isSaving} />
                </label>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Toevoegen
                </Button>
            </div>
        </form>
    )
}

const PriceInput: FC<{ value: string; onChange: (value: string) => void; disabled?: boolean }> = ({
    value,
    onChange,
    disabled,
}) => (
    <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
        <Input
            inputMode="decimal"
            placeholder="0,00"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="pl-7 w-full sm:w-32"
        />
    </div>
)

export default ShippingRatesEditor
