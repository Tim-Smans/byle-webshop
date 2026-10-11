"use client"

import Image from "next/image"
import Link from "next/link"
import { FC, ReactNode, useState } from "react"
import { Loader2, Lock, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrderAndDeliveryDialog, TermsOfServiceDialog } from "@/components/dialogs/service-dialogs"
import { useCart } from "@/lib/context/cart-context"
import { getShippingCost, type ShippingRate } from "@/lib/shop/shipping"
import { SHIPPING_COUNTRIES } from "@/lib/shop/countries"
import type { CheckoutErrors, CheckoutInput } from "@/lib/orders/checkout-validation"
import { formatPrice } from "@/lib/utils"
import { placeOrder } from "@/app/afrekenen/actions"
import { pendingOrderStore } from "@/lib/orders/pending-order"
import { PRICE_VAT_TEXT } from "@/lib/shop/config"

interface Props {
    rates: ShippingRate[]
    deliveryTimeText: string
    pickupLocationText: string
}

type FormState = Omit<CheckoutInput, "artPieceIds">

const CheckoutForm: FC<Props> = ({ rates, deliveryTimeText, pickupLocationText }) => {
    const { items, unavailableItems, subtotal, isLoading, refresh } = useCart()

    const [form, setForm] = useState<FormState>({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        isCompany: false,
        companyName: "",
        vatNumber: "",
        shippingMethod: rates.length > 0 ? "ship" : "pickup",
        countryCode: rates.find((rate) => rate.countryCode === "BE")?.countryCode ?? rates[0]?.countryCode ?? "",
        street: "",
        postalCode: "",
        city: "",
        billingSameAsShipping: true,
        billingCountryCode: "BE",
        billingStreet: "",
        billingPostalCode: "",
        billingCity: "",
        acceptTerms: false,
        website: "",
    })
    const [errors, setErrors] = useState<CheckoutErrors>({})
    const [message, setMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setErrors((prev) => ({ ...prev, [key]: undefined }))
    }

    if (isLoading && items.length === 0) {
        return (
            <div className="flex justify-center py-24">
                <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center text-center py-24">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-medium text-foreground mb-2">Je winkelmand is leeg</h2>
                <p className="text-muted-foreground mb-6">Bekijk de galerij en voeg een kunstwerk toe.</p>
                <Button asChild>
                    <Link href="/gallery">Naar de galerij</Link>
                </Button>
            </div>
        )
    }

    const selectedRate = rates.find((rate) => rate.countryCode === form.countryCode)
    const shippingCost =
        form.shippingMethod === "pickup"
            ? 0
            : selectedRate
                ? getShippingCost(selectedRate, items.map((item) => item.sizeClass))
                : null
    const total = subtotal + (shippingCost ?? 0)

    const showBillingAddress =
        (form.shippingMethod === "ship" && !form.billingSameAsShipping) ||
        (form.shippingMethod === "pickup" && form.isCompany)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setMessage(null)

        try {
            const result = await placeOrder({
                ...form,
                artPieceIds: items.map((item) => item.artPieceId),
                previousOrder: pendingOrderStore.get(),
            })

            if (result.ok) {
                pendingOrderStore.set({
                    orderId: result.orderId,
                    orderNumber: result.orderNumber,
                    accessToken: result.accessToken,
                })
                // Off to Mollie; keep the button disabled while the page changes
                window.location.assign(result.checkoutUrl)
                return
            }

            setErrors(result.fieldErrors ?? {})
            setMessage(result.message)
            refresh()
        } catch {
            setMessage("Er ging iets mis. Controleer je internetverbinding en probeer het opnieuw.")
        }

        setIsSubmitting(false)
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
            <div className="space-y-10">
                {/* Contact */}
                <FormSection title="Je gegevens">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Voornaam" error={errors.firstName}>
                            <Input autoComplete="given-name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
                        </Field>
                        <Field label="Achternaam" error={errors.lastName}>
                            <Input autoComplete="family-name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
                        </Field>
                        <Field label="E-mailadres" error={errors.email}>
                            <Input type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                        </Field>
                        <Field label="Telefoon (optioneel)" hint="Handig voor de vervoerder">
                            <Input type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                        </Field>
                    </div>

                    <Checkbox checked={form.isCompany} onChange={(checked) => update("isCompany", checked)}>
                        Ik bestel als bedrijf
                    </Checkbox>

                    {form.isCompany && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Bedrijfsnaam" error={errors.companyName}>
                                <Input autoComplete="organization" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
                            </Field>
                            <Field label="Btw-nummer" error={errors.vatNumber}>
                                <Input placeholder="BE0123456789" value={form.vatNumber} onChange={(e) => update("vatNumber", e.target.value)} />
                            </Field>
                        </div>
                    )}
                </FormSection>

                {/* Delivery */}
                <FormSection title="Levering">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <RadioCard
                            checked={form.shippingMethod === "ship"}
                            disabled={rates.length === 0}
                            onSelect={() => update("shippingMethod", "ship")}
                            title="Verzenden"
                            description={rates.length === 0 ? "Momenteel niet beschikbaar" : "Zorgvuldig verpakt, met trackingcode"}
                        />
                        <RadioCard
                            checked={form.shippingMethod === "pickup"}
                            onSelect={() => update("shippingMethod", "pickup")}
                            title="Afhalen (gratis)"
                            description={pickupLocationText}
                        />
                    </div>

                    {form.shippingMethod === "ship" && (
                        <div className="space-y-4">
                            <Field
                                label="Land"
                                error={errors.countryCode}
                                hint={
                                    <>
                                        Staat je land er niet bij?{" "}
                                        <Link href="/contact" className="underline underline-offset-4">Neem contact op</Link>{" "}
                                        voor een persoonlijke berekening.
                                    </>
                                }
                            >
                                <select
                                    autoComplete="country"
                                    value={form.countryCode}
                                    onChange={(e) => update("countryCode", e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    {rates.map((rate) => (
                                        <option key={rate.countryCode} value={rate.countryCode}>
                                            {rate.countryName}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Straat en huisnummer" error={errors.street}>
                                <Input autoComplete="street-address" value={form.street} onChange={(e) => update("street", e.target.value)} />
                            </Field>
                            <div className="grid grid-cols-[140px_1fr] gap-4">
                                <Field label="Postcode" error={errors.postalCode}>
                                    <Input autoComplete="postal-code" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} />
                                </Field>
                                <Field label="Gemeente" error={errors.city}>
                                    <Input autoComplete="address-level2" value={form.city} onChange={(e) => update("city", e.target.value)} />
                                </Field>
                            </div>

                            <Checkbox
                                checked={form.billingSameAsShipping}
                                onChange={(checked) => update("billingSameAsShipping", checked)}
                            >
                                Factuuradres is hetzelfde als het leveringsadres
                            </Checkbox>
                        </div>
                    )}
                </FormSection>

                {showBillingAddress && (
                    <FormSection title="Factuuradres">
                        <Field label="Land" error={errors.billingCountryCode}>
                            <select
                                value={form.billingCountryCode}
                                onChange={(e) => update("billingCountryCode", e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {SHIPPING_COUNTRIES.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Straat en huisnummer" error={errors.billingStreet}>
                            <Input value={form.billingStreet} onChange={(e) => update("billingStreet", e.target.value)} />
                        </Field>
                        <div className="grid grid-cols-[140px_1fr] gap-4">
                            <Field label="Postcode" error={errors.billingPostalCode}>
                                <Input value={form.billingPostalCode} onChange={(e) => update("billingPostalCode", e.target.value)} />
                            </Field>
                            <Field label="Gemeente" error={errors.billingCity}>
                                <Input value={form.billingCity} onChange={(e) => update("billingCity", e.target.value)} />
                            </Field>
                        </div>
                    </FormSection>
                )}

                {/* Honeypot, hidden from people */}
                <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
                    <label>
                        Website
                        <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} />
                    </label>
                </div>
            </div>

            {/* Summary */}
            <aside className="bg-card border border-border rounded-lg p-6 space-y-6 lg:sticky lg:top-32">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Overzicht
                </h2>

                <ul className="space-y-4">
                    {items.map((item) => (
                        <li key={item.artPieceId} className="flex gap-3">
                            <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                                {item.imageUrl && (
                                    <Image src={item.imageUrl} alt={item.title} fill sizes="56px" className="object-cover" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 text-sm">
                                <p className="font-medium text-foreground">{item.title}</p>
                                <p className="text-muted-foreground font-sans">{item.dimensions}</p>
                                {item.availability !== "available" && (
                                    <p className="text-red-700 font-sans">Niet meer beschikbaar</p>
                                )}
                            </div>
                            <p className="text-sm font-medium whitespace-nowrap">{formatPrice(item.price)}</p>
                        </li>
                    ))}
                </ul>

                <dl className="space-y-2 pt-4 border-t border-border text-sm font-sans">
                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">Subtotaal</dt>
                        <dd>{formatPrice(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">
                            {form.shippingMethod === "pickup" ? "Afhalen" : "Verzending"}
                        </dt>
                        <dd>{shippingCost === null ? "Kies een land" : shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</dd>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border text-base">
                        <dt className="font-medium">Totaal</dt>
                        <dd className="text-xl font-medium">{formatPrice(total)}</dd>
                    </div>
                    <p className="text-xs text-muted-foreground">{PRICE_VAT_TEXT}</p>
                </dl>

                <div className="space-y-2 text-xs font-sans text-muted-foreground">
                    {form.shippingMethod === "ship" && <p>{deliveryTimeText}</p>}
                    <p>
                        Je hebt 14 dagen bedenktijd vanaf de dag na ontvangst. De kosten om een werk
                        terug te sturen zijn voor jouw rekening.
                    </p>
                </div>

                <div>
                    <Checkbox checked={form.acceptTerms} onChange={(checked) => update("acceptTerms", checked)}>
                        Ik ga akkoord met de{" "}
                        <span className="underline underline-offset-4">
                            <TermsOfServiceDialog triggerText="algemene voorwaarden" />
                        </span>{" "}
                        en heb de informatie over{" "}
                        <span className="underline underline-offset-4">
                            <OrderAndDeliveryDialog triggerText="bestellen, levering en herroeping" />
                        </span>{" "}
                        gelezen.
                    </Checkbox>
                    {errors.acceptTerms && <p className="mt-1 text-xs text-red-700 font-sans">{errors.acceptTerms}</p>}
                </div>

                {message && (
                    <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-sans text-red-800">
                        {message}
                        {unavailableItems.length > 0 && (
                            <>
                                {" "}
                                <Link href="/winkelmand" className="underline underline-offset-4">Naar je winkelmand</Link>
                            </>
                        )}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isSubmitting || unavailableItems.length > 0 || shippingCost === null}
                    className="w-full py-6 text-base font-sans tracking-wide"
                >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
                    Bestellen en betalen
                </Button>

                <p className="text-center text-xs font-sans text-muted-foreground">
                    Je betaalt veilig via Mollie (Bancontact, kaart, …)
                </p>
            </aside>
        </form>
    )
}

const FormSection: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>
        {children}
    </section>
)

const Field: FC<{ label: string; error?: string; hint?: ReactNode; children: ReactNode }> = ({ label, error, hint, children }) => (
    <label className="block text-sm">
        <span className="block mb-1 text-foreground">{label}</span>
        {children}
        {error ? (
            <span className="block mt-1 text-xs text-red-700 font-sans">{error}</span>
        ) : hint ? (
            <span className="block mt-1 text-xs text-muted-foreground font-sans">{hint}</span>
        ) : null}
    </label>
)

const Checkbox: FC<{ checked: boolean; onChange: (checked: boolean) => void; children: ReactNode }> = ({ checked, onChange, children }) => (
    <label className="flex items-start gap-3 text-sm cursor-pointer">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
        />
        <span>{children}</span>
    </label>
)

const RadioCard: FC<{
    checked: boolean
    disabled?: boolean
    onSelect: () => void
    title: string
    description: string
}> = ({ checked, disabled, onSelect, title, description }) => (
    <button
        type="button"
        role="radio"
        aria-checked={checked}
        disabled={disabled}
        onClick={onSelect}
        className={`rounded-lg border p-4 text-left transition disabled:opacity-50 ${checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
    >
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground font-sans mt-0.5">{description}</span>
    </button>
)

export default CheckoutForm
