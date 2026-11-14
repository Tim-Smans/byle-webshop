"use client"

import Link from "next/link"
import { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Check, Clock, Copy, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { pendingDiscountStore } from "@/lib/shop/pending-discount"
import {
    BANNER_HIDDEN_ATTRIBUTE,
    type BannerData,
    type BannerMessage,
    type BannerTheme,
} from "@/lib/announcements/types"

const ROTATE_MS = 6000

const THEME_CLASSES: Record<BannerTheme, string> = {
    oker: "bg-oker text-white",
    bruin: "bg-primary text-primary-foreground",
    creme: "bg-warm-beige text-foreground",
    teal: "bg-teal text-white",
    feest: "announcement-feest text-white",
}

// Chip and pill colors that work on every theme
const SOFT_ON_THEME: Record<BannerTheme, string> = {
    oker: "border-white/60 bg-white/10 hover:bg-white/20",
    bruin: "border-primary-foreground/50 bg-white/10 hover:bg-white/20",
    creme: "border-foreground/40 bg-background/60 hover:bg-background",
    teal: "border-white/60 bg-white/10 hover:bg-white/20",
    feest: "border-white/70 bg-white/15 hover:bg-white/25",
}

interface Props {
    banner: BannerData
    // Admin preview: no closing, not part of the page layout
    preview?: boolean
}

const AnnouncementBar: FC<Props> = ({ banner, preview = false }) => {
    // Server render shows everything; after mounting the visitor's clock decides
    const [now, setNow] = useState<number | null>(null)
    const [index, setIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const tick = () => setNow(Date.now())
        const first = setTimeout(tick, 0)
        const timer = setInterval(tick, 1000)
        return () => {
            clearTimeout(first)
            clearInterval(timer)
        }
    }, [])

    const messages = banner.messages.filter(
        (message) => now === null || !message.hideAt || new Date(message.hideAt).getTime() > now
    )
    const current = messages.length > 0 ? messages[index % messages.length] : null

    // Nothing left to show (everything ran out while the page was open)
    useEffect(() => {
        if (preview) return
        if (!current) document.documentElement.setAttribute(BANNER_HIDDEN_ATTRIBUTE, "")
    }, [current, preview])

    // Take turns; hovering or focusing pauses, so a code can be read and copied
    useEffect(() => {
        if (messages.length < 2 || isPaused) return
        const timer = setInterval(() => setIndex((i) => i + 1), ROTATE_MS)
        return () => clearInterval(timer)
    }, [messages.length, isPaused])

    // Hidden until the next page load: nothing is remembered, so after a
    // refresh the visitor sees the banner again
    const dismiss = () => {
        document.documentElement.setAttribute(BANNER_HIDDEN_ATTRIBUTE, "")
    }

    if (!current) return null

    return (
        <div
            className={cn(
                "@container relative h-10 overflow-hidden transition-colors duration-500 print:hidden",
                !preview && "announcement-bar",
                THEME_CLASSES[current.theme]
            )}
            role="region"
            aria-label="Aankondiging"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
        >
            <div className="mx-auto flex h-full max-w-7xl items-center gap-2 px-3 @md:px-6">
                {/* Keeps the message centered next to the close button */}
                {!preview && <span className="w-7 shrink-0" aria-hidden />}

                <div
                    key={`${current.id}-${index}`}
                    className="flex min-w-0 flex-1 items-center justify-center gap-2 @md:gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500 motion-reduce:animate-none"
                    aria-live={messages.length > 1 ? "off" : "polite"}
                >
                    <MessageContent message={current} now={now} preview={preview} />
                </div>

                {messages.length > 1 && (
                    <div className="hidden @2xl:flex items-center gap-1.5 shrink-0" aria-label="Berichten">
                        {messages.map((message, i) => (
                            <button
                                key={message.id}
                                type="button"
                                onClick={() => setIndex(i)}
                                aria-label={`Bericht ${i + 1} van ${messages.length}`}
                                aria-current={i === index % messages.length}
                                className={cn(
                                    "h-1.5 rounded-full bg-current transition-all",
                                    i === index % messages.length ? "w-4 opacity-90" : "w-1.5 opacity-40 hover:opacity-70"
                                )}
                            />
                        ))}
                    </div>
                )}

                {!preview && (
                    <button
                        type="button"
                        onClick={dismiss}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-70 hover:opacity-100 hover:bg-black/10 transition"
                        aria-label="Aankondiging sluiten"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    )
}

const MessageContent: FC<{ message: BannerMessage; now: number | null; preview: boolean }> = ({ message, now, preview }) => {
    const text = (
        <MarqueeText>
            {message.theme === "feest" && <Sparkles className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px" aria-hidden />}
            {message.message}
        </MarqueeText>
    )

    const linkLabel = (
        <span className="hidden @lg:inline whitespace-nowrap underline underline-offset-4 decoration-current/50 group-hover:decoration-current">
            {message.linkLabel || "Bekijk"} →
        </span>
    )

    return (
        <>
            {message.linkUrl && preview ? (
                // Admin preview: looks like the link, goes nowhere
                <span className="group flex min-w-0 items-center gap-2 text-sm font-sans tracking-wide">
                    {text}
                    {linkLabel}
                </span>
            ) : message.linkUrl ? (
                <Link
                    href={message.linkUrl}
                    className="group flex min-w-0 items-center gap-2 text-sm font-sans tracking-wide"
                >
                    {text}
                    {linkLabel}
                </Link>
            ) : (
                <span className="flex min-w-0 items-center text-sm font-sans tracking-wide">{text}</span>
            )}

            {message.code && <CodeChip code={message.code} label={message.codeLabel} theme={message.theme} preview={preview} />}

            {message.countdownTo && now !== null && (
                <Countdown to={message.countdownTo} now={now} theme={message.theme} />
            )}
        </>
    )
}

// Long text scrolls back and forth when it doesn't fit (e.g. on a phone)
const MarqueeText: FC<{ children: React.ReactNode }> = ({ children }) => {
    const outerRef = useRef<HTMLSpanElement>(null)
    const innerRef = useRef<HTMLSpanElement>(null)
    const [distance, setDistance] = useState(0)

    const measure = useCallback(() => {
        const outer = outerRef.current
        const inner = innerRef.current
        if (!outer || !inner) return
        const overflow = inner.scrollWidth - outer.clientWidth
        setDistance(overflow > 4 ? overflow + 8 : 0)
    }, [])

    useLayoutEffect(() => {
        measure()
        const observer = new ResizeObserver(measure)
        if (outerRef.current) observer.observe(outerRef.current)
        return () => observer.disconnect()
    }, [measure])

    return (
        <span ref={outerRef} className="relative block min-w-0 overflow-hidden">
            <span
                ref={innerRef}
                className={cn(
                    "inline-block whitespace-nowrap",
                    distance > 0 && "announcement-marquee motion-reduce:animate-none"
                )}
                style={
                    distance > 0
                        ? ({
                            "--marquee-distance": `-${distance}px`,
                            animationDuration: `${Math.max(6, distance / 25 + 4)}s`,
                        } as React.CSSProperties)
                        : undefined
                }
            >
                {children}
            </span>
        </span>
    )
}

const CodeChip: FC<{ code: string; label: string | null; theme: BannerTheme; preview: boolean }> = ({ code, label, theme, preview }) => {
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!copied) return
        const timer = setTimeout(() => setCopied(false), 2500)
        return () => clearTimeout(timer)
    }, [copied])

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code)
        } catch {
            // Clipboard blocked: the code is still applied at checkout
        }
        // Not from the admin preview: that would apply the code in the admin's own cart
        if (!preview) pendingDiscountStore.set(code)
        setCopied(true)
    }

    return (
        <button
            type="button"
            onClick={copy}
            title="Klik om te kopiëren. De code wordt automatisch toegepast bij het afrekenen."
            className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-dashed px-2.5 py-0.5 text-xs font-sans transition-colors",
                SOFT_ON_THEME[theme]
            )}
        >
            {copied ? (
                <>
                    <Check className="h-3.5 w-3.5" />
                    <span className="@md:hidden">Gekopieerd</span>
                    <span className="hidden @md:inline">Gekopieerd, wordt toegepast bij afrekenen</span>
                </>
            ) : (
                <>
                    <span className="font-mono font-semibold tracking-wider">{code}</span>
                    {label && <span className="hidden @sm:inline opacity-80">{label}</span>}
                    <Copy className="h-3 w-3 opacity-70" />
                </>
            )}
            <span className="sr-only" aria-live="polite">{copied ? "Kortingscode gekopieerd" : ""}</span>
        </button>
    )
}

function formatRemaining(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const pad = (n: number) => String(n).padStart(2, "0")

    if (days >= 2) return `nog ${days} dagen`
    if (days === 1) return `nog 1 dag ${hours}u`
    return `nog ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

const Countdown: FC<{ to: string; now: number; theme: BannerTheme }> = ({ to, now, theme }) => {
    const remaining = new Date(to).getTime() - now
    if (remaining <= 0) return null
    const isLastDay = remaining < 86400000

    return (
        <span
            className={cn(
                "hidden @md:inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-sans tabular-nums",
                SOFT_ON_THEME[theme],
                isLastDay && "font-semibold"
            )}
            title={`Tot ${new Intl.DateTimeFormat("nl-BE", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Brussels" }).format(new Date(to))}`}
        >
            <Clock className={cn("h-3 w-3", isLastDay && "motion-safe:animate-pulse")} aria-hidden />
            {formatRemaining(remaining)}
        </span>
    )
}

export default AnnouncementBar
