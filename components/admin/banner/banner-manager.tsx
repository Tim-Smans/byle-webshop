"use client"

import { FC, ReactNode, useRef, useState } from "react"
import { ArrowDown, ArrowUp, Loader2, Megaphone, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFeedback } from "@/lib/context/feedback-context"
import { cn } from "@/lib/utils"
import AnnouncementBar from "@/components/announcements/announcement-bar"
import {
    BANNER_THEMES,
    BANNER_THEME_LABELS,
    SALE_GALLERY_URL,
    type BannerData,
    type BannerTheme,
} from "@/lib/announcements/types"
import { brusselsLocalToIso, endOfBrusselsDay } from "@/lib/shop/brussels-time"
import {
    deleteAnnouncement,
    moveAnnouncement,
    saveAnnouncement,
    setAnnouncementActive,
    setBannerEnabled,
} from "@/app/admin/banner/actions"

export interface AdminAnnouncement {
    id: string
    message: string
    linkUrl: string
    linkLabel: string
    discountCodeId: string | null
    code: string | null
    codeLabel: string | null
    theme: BannerTheme
    showCountdown: boolean
    // "2026-11-20T23:59" in Belgian time, or ""
    startsAt: string
    endsAt: string
    endsAtIso: string | null
    isActive: boolean
    status: { label: string; tone: "live" | "planned" | "warning" | "muted" }
}

export interface CodeOption {
    id: string
    code: string
    label: string
    usable: boolean
    validUntil: string | null
}

interface Props {
    enabled: boolean
    announcements: AdminAnnouncement[]
    codes: CodeOption[]
    // What the site shows now (also when the banner is switched off)
    current: BannerData | null
}

const MAX_LENGTH = 200
// About what fits next to a code on a phone without scrolling
const PHONE_LENGTH = 40

const THEME_SWATCHES: Record<BannerTheme, string> = {
    oker: "bg-oker",
    bruin: "bg-primary",
    creme: "bg-warm-beige border border-border",
    teal: "bg-teal",
    feest: "announcement-feest",
}

const STATUS_CLASSES: Record<AdminAnnouncement["status"]["tone"], string> = {
    live: "bg-emerald-100 text-emerald-900",
    planned: "bg-sky-100 text-sky-900",
    warning: "bg-amber-100 text-amber-900",
    muted: "bg-muted text-muted-foreground",
}

const LINK_PRESETS = [
    { value: "", label: "Geen link", defaultLabel: "" },
    { value: "/gallery", label: "Galerie", defaultLabel: "Naar de galerie" },
    { value: SALE_GALLERY_URL, label: "Werken in korting", defaultLabel: "Bekijk de werken" },
    { value: "/maatwerk", label: "Kunstwerk op maat", defaultLabel: "Meer info" },
    { value: "/contact", label: "Contact", defaultLabel: "Contacteer me" },
] as const
const CUSTOM_LINK = "custom"

interface FormState {
    message: string
    linkUrl: string
    linkLabel: string
    discountCodeId: string
    theme: BannerTheme
    showCountdown: boolean
    startsAt: string
    endsAt: string
}

const EMPTY_FORM: FormState = {
    message: "",
    linkUrl: "",
    linkLabel: "",
    discountCodeId: "",
    theme: "oker",
    showCountdown: false,
    startsAt: "",
    endsAt: "",
}

// Starting points; everything can be changed afterwards
const TEMPLATES: { title: string; emoji: string; form: (codes: CodeOption[]) => Partial<FormState> }[] = [
    {
        title: "Kortingsactie",
        emoji: "🎉",
        form: (codes) => ({
            message: "Najaarsactie: korting op alle kunstwerken",
            theme: "feest",
            linkUrl: "/gallery",
            linkLabel: "Shop nu",
            discountCodeId: codes.find((code) => code.usable)?.id ?? "",
            showCountdown: true,
        }),
    },
    {
        title: "Werken in korting",
        emoji: "🏷️",
        form: () => ({
            message: "Enkele kunstwerken staan nu in korting",
            theme: "oker",
            linkUrl: SALE_GALLERY_URL,
            linkLabel: "Bekijk de werken",
        }),
    },
    {
        title: "Nieuw werk",
        emoji: "🖼️",
        form: () => ({
            message: "Nieuwe kunstwerken in de galerie",
            theme: "bruin",
            linkUrl: "/gallery",
            linkLabel: "Ontdek ze",
        }),
    },
    {
        title: "Op maat",
        emoji: "✨",
        form: () => ({
            message: "Een uniek kunstwerk op maat, als cadeau of voor jezelf",
            theme: "creme",
            linkUrl: "/maatwerk",
            linkLabel: "Meer info",
        }),
    },
    {
        title: "Levering",
        emoji: "📦",
        form: () => ({
            message: "Zorgvuldig verpakt en binnen 5 werkdagen verzonden, of gratis afhalen in Vlimmeren",
            theme: "teal",
        }),
    },
]

const BannerManager: FC<Props> = ({ enabled, announcements, codes, current }) => {
    const [editing, setEditing] = useState<AdminAnnouncement | null>(null)
    const formRef = useRef<HTMLDivElement>(null)

    const startEdit = (announcement: AdminAnnouncement) => {
        setEditing(announcement)
        requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
    }

    return (
        <div className="space-y-12">
            <MasterSwitch enabled={enabled} visibleCount={current?.messages.length ?? 0} />

            <section>
                <SectionTitle>{enabled ? "Nu op de website" : "Zo ziet het eruit als je de banner aanzet"}</SectionTitle>
                {current ? (
                    <div className={cn("rounded-lg overflow-hidden border border-border", !enabled && "opacity-60")}>
                        <AnnouncementBar banner={current} preview />
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-4">
                        Er is nu geen bericht om te tonen. Maak hieronder een bericht aan, of zet er een aan.
                    </p>
                )}
            </section>

            <section>
                <SectionTitle>Berichten</SectionTitle>
                {announcements.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
                        <Megaphone size={20} className="mx-auto mb-3 opacity-60" />
                        Nog geen berichten. Begin hieronder met een sjabloon.
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <ul className="divide-y divide-border">
                            {announcements.map((announcement, index) => (
                                <AnnouncementRow
                                    key={`${announcement.id}-${announcement.isActive}-${index}`}
                                    announcement={announcement}
                                    isFirst={index === 0}
                                    isLast={index === announcements.length - 1}
                                    isEditing={editing?.id === announcement.id}
                                    onEdit={() => startEdit(announcement)}
                                />
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            <div ref={formRef} className="scroll-mt-28">
                <AnnouncementForm
                    key={editing?.id ?? "new"}
                    announcement={editing}
                    codes={codes}
                    onDone={() => setEditing(null)}
                />
            </div>
        </div>
    )
}

const SectionTitle: FC<{ children: ReactNode }> = ({ children }) => (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">{children}</h2>
)

const Switch: FC<{ checked: boolean; disabled?: boolean; label: string; onChange: () => void }> = ({
    checked,
    disabled,
    label,
    onChange,
}) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-emerald-600" : "bg-border"}`}
    >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
)

const MasterSwitch: FC<{ enabled: boolean; visibleCount: number }> = ({ enabled, visibleCount }) => {
    const { showError } = useFeedback()
    const [isSaving, setIsSaving] = useState(false)

    const toggle = async () => {
        setIsSaving(true)
        try {
            await setBannerEnabled(!enabled)
        } catch (err) {
            showError(err instanceof Error ? err.message : "Opslaan mislukt")
        } finally {
            setIsSaving(false)
        }
    }

    const status = !enabled
        ? "Uit: bezoekers zien geen banner."
        : visibleCount === 0
            ? "Aan, maar er is nu geen bericht zichtbaar."
            : `Aan: ${visibleCount === 1 ? "1 bericht" : `${visibleCount} berichten wisselen elkaar af`}.`

    return (
        <div className={cn("flex items-center justify-between gap-4 rounded-lg border p-5", enabled ? "border-emerald-200 bg-emerald-50/60" : "border-border bg-card")}>
            <div>
                <p className="font-medium text-foreground">Banner op de website</p>
                <p className="text-sm text-muted-foreground mt-0.5">{status}</p>
            </div>
            <div className="flex items-center gap-2">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <Switch checked={enabled} disabled={isSaving} label="Banner aan of uit" onChange={toggle} />
            </div>
        </div>
    )
}

const AnnouncementRow: FC<{
    announcement: AdminAnnouncement
    isFirst: boolean
    isLast: boolean
    isEditing: boolean
    onEdit: () => void
}> = ({ announcement, isFirst, isLast, isEditing, onEdit }) => {
    const { showError, showWarning } = useFeedback()
    const [isSaving, setIsSaving] = useState(false)

    const run = async (action: () => Promise<void>, failure: string) => {
        setIsSaving(true)
        try {
            await action()
        } catch (err) {
            showError(err instanceof Error ? err.message : failure)
        } finally {
            setIsSaving(false)
        }
    }

    const linkName = LINK_PRESETS.find((preset) => preset.value && preset.value === announcement.linkUrl)?.label ?? announcement.linkUrl

    return (
        <li className={cn("flex flex-wrap items-start gap-x-4 gap-y-3 px-4 py-4 text-sm", isEditing && "bg-primary/5")}>
            <span className={cn("mt-1 h-4 w-4 shrink-0 rounded-full", THEME_SWATCHES[announcement.theme])} aria-hidden />

            <div className="flex-1 min-w-[200px]">
                <p className="text-foreground">{announcement.message}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className={cn("px-2 py-0.5 rounded-full", STATUS_CLASSES[announcement.status.tone])}>
                        {announcement.status.label}
                    </span>
                    {announcement.code && (
                        <span className="font-mono border border-dashed border-border rounded-full px-2 py-0.5">
                            {announcement.code} {announcement.codeLabel}
                        </span>
                    )}
                    {announcement.linkUrl && <span>→ {linkName}</span>}
                    {announcement.showCountdown && <span>⏱ aftelklok</span>}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Switch
                    checked={announcement.isActive}
                    disabled={isSaving}
                    label="Bericht aan of uit"
                    onChange={() => run(() => setAnnouncementActive(announcement.id, !announcement.isActive), "Opslaan mislukt")}
                />
                <div className="flex flex-col">
                    <button
                        onClick={() => run(() => moveAnnouncement(announcement.id, -1), "Verplaatsen mislukt")}
                        disabled={isSaving || isFirst}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        aria-label="Naar boven"
                    >
                        <ArrowUp size={14} />
                    </button>
                    <button
                        onClick={() => run(() => moveAnnouncement(announcement.id, 1), "Verplaatsen mislukt")}
                        disabled={isSaving || isLast}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        aria-label="Naar beneden"
                    >
                        <ArrowDown size={14} />
                    </button>
                </div>
                <button
                    onClick={onEdit}
                    disabled={isSaving}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                    aria-label="Bericht aanpassen"
                >
                    <Pencil size={16} />
                </button>
                <button
                    onClick={() => showWarning("Dit bericht verwijderen?", () => run(() => deleteAnnouncement(announcement.id), "Verwijderen mislukt"))}
                    disabled={isSaving}
                    className="text-muted-foreground hover:text-red-700 disabled:opacity-50"
                    aria-label="Bericht verwijderen"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </li>
    )
}

const AnnouncementForm: FC<{ announcement: AdminAnnouncement | null; codes: CodeOption[]; onDone: () => void }> = ({
    announcement,
    codes,
    onDone,
}) => {
    const { showError, showSuccess } = useFeedback()
    const isEdit = announcement !== null

    const [form, setForm] = useState<FormState>(
        announcement
            ? {
                message: announcement.message,
                linkUrl: announcement.linkUrl,
                linkLabel: announcement.linkLabel,
                discountCodeId: announcement.discountCodeId ?? "",
                theme: announcement.theme,
                showCountdown: announcement.showCountdown,
                startsAt: announcement.startsAt,
                endsAt: announcement.endsAt,
            }
            : EMPTY_FORM
    )
    const [isCustomLink, setIsCustomLink] = useState(
        !!form.linkUrl && !LINK_PRESETS.some((preset) => preset.value === form.linkUrl)
    )
    const [isSaving, setIsSaving] = useState(false)

    const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }))

    const selectedCode = codes.find((code) => code.id === form.discountCodeId) ?? null
    const countdownEnd = earliestIso(
        form.endsAt ? brusselsLocalToIso(form.endsAt) : null,
        selectedCode?.validUntil ? endOfBrusselsDay(selectedCode.validUntil) : null
    )

    const preview: BannerData = {
        messages: [
            {
                id: "preview",
                message: form.message.trim() || "Je tekst komt hier",
                linkUrl: form.linkUrl || null,
                linkLabel: form.linkLabel || null,
                code: selectedCode?.code ?? null,
                codeLabel: selectedCode?.label ?? null,
                theme: form.theme,
                countdownTo: form.showCountdown ? countdownEnd : null,
                hideAt: null,
            },
        ],
    }

    const applyTemplate = (template: (typeof TEMPLATES)[number]) => {
        const values = template.form(codes)
        setForm({ ...EMPTY_FORM, ...values, startsAt: form.startsAt, endsAt: form.endsAt })
        setIsCustomLink(false)
    }

    const chooseLink = (value: string) => {
        if (value === CUSTOM_LINK) {
            setIsCustomLink(true)
            update("linkUrl", "")
            return
        }
        const preset = LINK_PRESETS.find((option) => option.value === value)
        setIsCustomLink(false)
        setForm((prev) => ({
            ...prev,
            linkUrl: value,
            // Suggest a label, unless the admin typed their own
            linkLabel:
                !prev.linkLabel || LINK_PRESETS.some((option) => option.defaultLabel === prev.linkLabel)
                    ? preset?.defaultLabel ?? ""
                    : prev.linkLabel,
        }))
    }

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await saveAnnouncement(announcement?.id ?? null, {
                ...form,
                discountCodeId: form.discountCodeId || null,
                isActive: announcement?.isActive ?? true,
            })
            showSuccess(isEdit ? "Bericht aangepast." : "Bericht toegevoegd aan de banner.")
            if (isEdit) onDone()
            else {
                setForm(EMPTY_FORM)
                setIsCustomLink(false)
            }
        } catch (err) {
            showError(err instanceof Error ? err.message : "Opslaan mislukt")
        } finally {
            setIsSaving(false)
        }
    }

    const length = form.message.trim().length

    return (
        <form onSubmit={submit} className="bg-card border border-border rounded-lg p-5 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <SectionTitle>{isEdit ? "Bericht aanpassen" : "Nieuw bericht"}</SectionTitle>
                {isEdit && (
                    <button type="button" onClick={onDone} className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 -mt-4">
                        Annuleren
                    </button>
                )}
            </div>

            {!isEdit && (
                <div>
                    <p className="text-sm text-muted-foreground mb-2">Begin met een sjabloon</p>
                    <div className="flex flex-wrap gap-2">
                        {TEMPLATES.map((template) => (
                            <button
                                key={template.title}
                                type="button"
                                onClick={() => applyTemplate(template)}
                                className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted transition"
                            >
                                <span aria-hidden className="mr-1.5">{template.emoji}</span>
                                {template.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Live preview, wide and phone-sized */}
            <div className="space-y-3 rounded-lg bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Voorbeeld</p>
                <div className="rounded-md overflow-hidden border border-border">
                    <AnnouncementBar banner={preview} preview />
                </div>
                <div className="flex items-end gap-3">
                    <div className="w-[360px] max-w-full rounded-md overflow-hidden border border-border">
                        <AnnouncementBar banner={preview} preview />
                    </div>
                    <span className="text-xs text-muted-foreground pb-3">op een gsm</span>
                </div>
            </div>

            <Field
                label="Tekst"
                hint={
                    <span className={cn(length > MAX_LENGTH && "text-red-700")}>
                        {length}/{MAX_LENGTH}
                        {length > PHONE_LENGTH && length <= MAX_LENGTH && " · op een gsm schuift de tekst langzaam heen en weer"}
                    </span>
                }
            >
                <Input
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="bv. Gratis verzending in België tot zondag"
                    maxLength={MAX_LENGTH + 20}
                    required
                />
            </Field>

            <Field label="Kleur">
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Kleur">
                    {BANNER_THEMES.map((theme) => (
                        <button
                            key={theme}
                            type="button"
                            role="radio"
                            aria-checked={form.theme === theme}
                            onClick={() => update("theme", theme)}
                            className={cn(
                                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                                form.theme === theme ? "border-primary bg-primary/5 font-medium" : "border-border hover:bg-muted"
                            )}
                        >
                            <span className={cn("h-4 w-4 rounded-full", THEME_SWATCHES[theme])} aria-hidden />
                            {BANNER_THEME_LABELS[theme]}
                        </button>
                    ))}
                </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Link">
                    <select
                        value={isCustomLink ? CUSTOM_LINK : form.linkUrl}
                        onChange={(e) => chooseLink(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        {LINK_PRESETS.map((preset) => (
                            <option key={preset.label} value={preset.value}>{preset.label}</option>
                        ))}
                        <option value={CUSTOM_LINK}>Andere link…</option>
                    </select>
                    {isCustomLink && (
                        <Input
                            value={form.linkUrl}
                            onChange={(e) => update("linkUrl", e.target.value)}
                            placeholder="/art/… of https://…"
                            className="mt-2"
                        />
                    )}
                </Field>

                <Field label="Tekst van de link" hint="Alleen te zien op grotere schermen; op een gsm is de tekst zelf klikbaar">
                    <Input
                        value={form.linkLabel}
                        onChange={(e) => update("linkLabel", e.target.value)}
                        placeholder="Bekijk"
                        maxLength={40}
                        disabled={!form.linkUrl}
                    />
                </Field>

                <Field
                    label="Kortingscode tonen (optioneel)"
                    hint={
                        selectedCode && !selectedCode.usable
                            ? "Deze code is nu niet bruikbaar: het bericht blijft verborgen tot ze dat wel is."
                            : "Het bericht verdwijnt vanzelf als de code verloopt of op is."
                    }
                >
                    <select
                        value={form.discountCodeId}
                        onChange={(e) => update("discountCodeId", e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="">Geen kortingscode</option>
                        {codes.map((code) => (
                            <option key={code.id} value={code.id}>
                                {code.code} ({code.label}){code.usable ? "" : ", nu niet bruikbaar"}
                            </option>
                        ))}
                    </select>
                    {codes.length === 0 && (
                        <span className="block mt-1 text-xs text-muted-foreground">
                            Nog geen codes. Maak er een aan onder <a href="/admin/kortingen" className="underline underline-offset-4">Kortingen</a>.
                        </span>
                    )}
                </Field>

                <div />

                <Field label="Tonen vanaf (optioneel)">
                    <Input type="datetime-local" value={form.startsAt} onChange={(e) => update("startsAt", e.target.value)} />
                </Field>

                <Field label="Tonen tot (optioneel)">
                    <Input type="datetime-local" value={form.endsAt} onChange={(e) => update("endsAt", e.target.value)} />
                </Field>
            </div>

            <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input
                    type="checkbox"
                    checked={form.showCountdown}
                    onChange={(e) => update("showCountdown", e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span>
                    Aftelklok tonen
                    <span className="block text-xs text-muted-foreground">
                        {countdownEnd
                            ? "Telt af tot het einde van het bericht of de kortingscode (wat eerst komt). Op een gsm niet zichtbaar."
                            : "Vul een einde in, of kies een kortingscode met een einddatum."}
                    </span>
                </span>
            </label>

            <div className="flex justify-end">
                <Button type="submit" disabled={isSaving || length === 0 || length > MAX_LENGTH}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : !isEdit && <Plus className="h-4 w-4" />}
                    {isEdit ? "Opslaan" : "Toevoegen aan de banner"}
                </Button>
            </div>
        </form>
    )
}

function earliestIso(...values: (string | null)[]): string | null {
    return values.filter((value): value is string => !!value).sort()[0] ?? null
}

const Field: FC<{ label: string; hint?: ReactNode; children: ReactNode }> = ({ label, hint, children }) => (
    <label className="block text-sm">
        <span className="block text-muted-foreground mb-1">{label}</span>
        {children}
        {hint && <span className="block mt-1 text-xs text-muted-foreground">{hint}</span>}
    </label>
)

export default BannerManager
