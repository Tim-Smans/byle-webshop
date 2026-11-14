"use client"

import { FC, ReactNode, useRef, useState } from "react"
import { Loader2, Pencil, Plus, Tag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFeedback } from "@/lib/context/feedback-context"
import { describeDiscount, normalizeDiscountCode, type DiscountCode, type DiscountType } from "@/lib/shop/discount"
import { formatPrice } from "@/lib/utils"
import { deleteDiscountCode, saveDiscountCode, setDiscountCodeActive } from "@/app/admin/kortingen/actions"

interface Props {
    codes: DiscountCode[]
    // YYYY-MM-DD in Belgian time
    today: string
}

// Accepts both "12,50" and "12.50"; empty is null
function parseNumber(value: string): number | null {
    const trimmed = value.trim()
    return trimmed ? Number(trimmed.replace(",", ".")) : null
}

const formatDay = (value: string) => {
    const [year, month, day] = value.split("-")
    return `${day}/${month}/${year}`
}

function getStatus(code: DiscountCode, today: string): { label: string; className: string } {
    if (!code.isActive) return { label: "Uit", className: "bg-muted text-muted-foreground" }
    if (code.validFrom && today < code.validFrom) return { label: `Vanaf ${formatDay(code.validFrom)}`, className: "bg-amber-100 text-amber-900" }
    if (code.validUntil && today > code.validUntil) return { label: "Verlopen", className: "bg-muted text-muted-foreground" }
    if (code.maxUses !== null && code.timesUsed >= code.maxUses) return { label: "Opgebruikt", className: "bg-muted text-muted-foreground" }
    return { label: "Actief", className: "bg-emerald-100 text-emerald-900" }
}

const DiscountCodesManager: FC<Props> = ({ codes, today }) => {
    const [editing, setEditing] = useState<DiscountCode | null>(null)
    const formRef = useRef<HTMLDivElement>(null)

    const startEdit = (code: DiscountCode) => {
        setEditing(code)
        requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
    }

    return (
        <div className="space-y-8">
            {codes.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
                    <Tag size={20} className="mx-auto mb-3 opacity-60" />
                    Nog geen kortingscodes. Maak hieronder je eerste code aan.
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <ul className="divide-y divide-border">
                        {codes.map((code) => (
                            <CodeRow
                                key={`${code.id}-${code.isActive}`}
                                code={code}
                                today={today}
                                isEditing={editing?.id === code.id}
                                onEdit={() => startEdit(code)}
                            />
                        ))}
                    </ul>
                </div>
            )}

            <div ref={formRef} className="scroll-mt-28">
                <CodeForm
                    // Remount to reset the fields when switching between codes
                    key={editing?.id ?? "new"}
                    code={editing}
                    onDone={() => setEditing(null)}
                />
            </div>
        </div>
    )
}

const CodeRow: FC<{ code: DiscountCode; today: string; isEditing: boolean; onEdit: () => void }> = ({
    code,
    today,
    isEditing,
    onEdit,
}) => {
    const { showError, showWarning } = useFeedback()
    const [isSaving, setIsSaving] = useState(false)
    const status = getStatus(code, today)

    const conditions = [
        code.minOrderAmount !== null && `vanaf ${formatPrice(code.minOrderAmount)}`,
        code.validFrom && `vanaf ${formatDay(code.validFrom)}`,
        code.validUntil && `t.e.m. ${formatDay(code.validUntil)}`,
        code.excludeSaleItems && "niet op werken in korting",
    ].filter(Boolean)

    const toggle = async () => {
        setIsSaving(true)
        try {
            await setDiscountCodeActive(code.id, !code.isActive)
        } catch (err) {
            showError(err instanceof Error ? err.message : "Opslaan mislukt")
            setIsSaving(false)
        }
    }

    const remove = async () => {
        setIsSaving(true)
        try {
            await deleteDiscountCode(code.id)
        } catch (err) {
            showError(err instanceof Error ? err.message : "Verwijderen mislukt")
            setIsSaving(false)
        }
    }

    return (
        <li className={`flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-4 text-sm ${isEditing ? "bg-primary/5" : ""}`}>
            <div className="flex-1 min-w-[200px]">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold tracking-wide text-foreground">{code.code}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${status.className}`}>{status.label}</span>
                </div>
                <p className="mt-1 text-foreground">
                    {describeDiscount(code.type, code.value)} korting
                    {conditions.length > 0 && <span className="text-muted-foreground"> · {conditions.join(" · ")}</span>}
                </p>
                {code.description && <p className="mt-1 text-xs text-muted-foreground">{code.description}</p>}
            </div>

            <div className="text-xs text-muted-foreground min-w-[120px]">
                <p>
                    <span className="text-foreground">{code.timesUsed}</span>
                    {code.maxUses !== null ? ` / ${code.maxUses}` : ""} keer gebruikt
                </p>
                {code.totalDiscount > 0 && <p>{formatPrice(code.totalDiscount)} korting gegeven</p>}
            </div>

            <div className="flex items-center gap-4">
                <button
                    role="switch"
                    aria-checked={code.isActive}
                    aria-label={`${code.code} aan of uit`}
                    disabled={isSaving}
                    onClick={toggle}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${code.isActive ? "bg-emerald-600" : "bg-border"}`}
                >
                    <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${code.isActive ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                </button>
                <button
                    onClick={onEdit}
                    disabled={isSaving}
                    className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    aria-label={`${code.code} aanpassen`}
                >
                    <Pencil size={16} />
                </button>
                {code.timesUsed === 0 && (
                    <button
                        onClick={() => showWarning(`Kortingscode ${code.code} verwijderen?`, remove)}
                        disabled={isSaving}
                        className="text-muted-foreground hover:text-red-700 transition-colors disabled:opacity-50"
                        aria-label={`${code.code} verwijderen`}
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </li>
    )
}

const CodeForm: FC<{ code: DiscountCode | null; onDone: () => void }> = ({ code, onDone }) => {
    const { showError, showSuccess } = useFeedback()
    const isEdit = code !== null

    const [codeText, setCodeText] = useState(code?.code ?? "")
    const [type, setType] = useState<DiscountType>(code?.type ?? "percent")
    const [value, setValue] = useState(code ? String(code.value).replace(".", ",") : "")
    const [minOrderAmount, setMinOrderAmount] = useState(code?.minOrderAmount != null ? String(code.minOrderAmount).replace(".", ",") : "")
    const [maxUses, setMaxUses] = useState(code?.maxUses != null ? String(code.maxUses) : "")
    const [validFrom, setValidFrom] = useState(code?.validFrom ?? "")
    const [validUntil, setValidUntil] = useState(code?.validUntil ?? "")
    const [excludeSaleItems, setExcludeSaleItems] = useState(code?.excludeSaleItems ?? false)
    const [description, setDescription] = useState(code?.description ?? "")
    const [isSaving, setIsSaving] = useState(false)

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()

        const parsedValue = parseNumber(value)
        if (parsedValue === null) {
            showError("Vul in hoeveel korting de code geeft.")
            return
        }

        setIsSaving(true)
        try {
            await saveDiscountCode(code?.id ?? null, {
                code: codeText,
                description,
                type,
                value: parsedValue,
                minOrderAmount: parseNumber(minOrderAmount),
                maxUses: parseNumber(maxUses),
                validFrom: validFrom || null,
                validUntil: validUntil || null,
                excludeSaleItems,
                isActive: code?.isActive ?? true,
            })
            showSuccess(isEdit ? `Kortingscode ${normalizeDiscountCode(codeText)} aangepast.` : `Kortingscode ${normalizeDiscountCode(codeText)} aangemaakt.`)
            if (isEdit) {
                onDone()
            } else {
                setCodeText("")
                setValue("")
                setMinOrderAmount("")
                setMaxUses("")
                setValidFrom("")
                setValidUntil("")
                setExcludeSaleItems(false)
                setDescription("")
            }
        } catch (err) {
            showError(err instanceof Error ? err.message : "Opslaan mislukt")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form onSubmit={submit} className="bg-card border border-border rounded-lg p-5 space-y-5">
            <div className="flex items-center justify-between gap-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {isEdit ? `Kortingscode ${code.code} aanpassen` : "Nieuwe kortingscode"}
                </h3>
                {isEdit && (
                    <button type="button" onClick={onDone} className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
                        Annuleren
                    </button>
                )}
            </div>

            {isEdit && code.timesUsed > 0 && (
                <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    Deze code werd al {code.timesUsed} keer gebruikt. Wijzigingen gelden alleen voor nieuwe bestellingen.
                </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Code" hint="Wat de klant intypt, bv. ZOMER20. Hoofdletters maken niet uit.">
                    <Input
                        value={codeText}
                        onChange={(e) => setCodeText(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                        placeholder="ZOMER20"
                        maxLength={40}
                        className="font-mono uppercase"
                        required
                    />
                </Field>

                <Field label="Korting">
                    <div className="flex gap-2">
                        <div className="inline-flex rounded-md border border-input overflow-hidden shrink-0" role="radiogroup" aria-label="Soort korting">
                            {([
                                { value: "percent", label: "%" },
                                { value: "amount", label: "€" },
                            ] as const).map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={type === option.value}
                                    onClick={() => setType(option.value)}
                                    className={`px-3 text-sm transition-colors ${type === option.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <Input
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={type === "percent" ? "10" : "15,00"}
                            aria-label={type === "percent" ? "Percentage" : "Bedrag"}
                        />
                    </div>
                </Field>

                <Field label="Minimumbedrag (optioneel)" hint="Totaal van de werken, zonder verzending">
                    <Input inputMode="decimal" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} placeholder="bv. 150" />
                </Field>

                <Field label="Hoe vaak te gebruiken (optioneel)" hint="Leeg = onbeperkt. 1 = eenmalige code.">
                    <Input inputMode="numeric" value={maxUses} onChange={(e) => setMaxUses(e.target.value.replace(/[^0-9]/g, ""))} placeholder="onbeperkt" />
                </Field>

                <Field label="Geldig vanaf (optioneel)">
                    <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
                </Field>

                <Field label="Geldig tot en met (optioneel)">
                    <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                </Field>

                <Field label="Notitie (optioneel)" hint="Alleen voor jou, bv. waarvoor de code dient" className="sm:col-span-2">
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="bv. Nieuwsbrief november" maxLength={300} />
                </Field>
            </div>

            <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input
                    type="checkbox"
                    checked={excludeSaleItems}
                    onChange={(e) => setExcludeSaleItems(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span>
                    Niet geldig op werken die al in korting staan
                    <span className="block text-xs text-muted-foreground">
                        Anders komt de code bovenop de korting van het werk.
                    </span>
                </span>
            </label>

            <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : !isEdit && <Plus className="h-4 w-4" />}
                    {isEdit ? "Opslaan" : "Code aanmaken"}
                </Button>
            </div>
        </form>
    )
}

const Field: FC<{ label: string; hint?: string; className?: string; children: ReactNode }> = ({ label, hint, className, children }) => (
    <label className={`block text-sm ${className ?? ""}`}>
        <span className="block text-muted-foreground mb-1">{label}</span>
        {children}
        {hint && <span className="block mt-1 text-xs text-muted-foreground">{hint}</span>}
    </label>
)

export default DiscountCodesManager
