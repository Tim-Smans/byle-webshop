import { Check } from "lucide-react"
import type { TimelineStep } from "@/lib/orders/timeline"

const dateFormatter = new Intl.DateTimeFormat("nl-BE", { dateStyle: "long", timeZone: "Europe/Brussels" })

export default function OrderTimeline({ steps }: { steps: TimelineStep[] }) {
    if (steps.length === 0) return null

    return (
        <section className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                Waar is je bestelling?
            </h2>
            <ol>
                {steps.map((step, index) => {
                    const isLast = index === steps.length - 1
                    return (
                        <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
                            {/* Connector line to the next step */}
                            {!isLast && (
                                <span
                                    aria-hidden
                                    className={`absolute left-[11px] top-7 bottom-0 w-px ${step.state === "done" ? "bg-emerald-700/40" : "bg-border"}`}
                                />
                            )}
                            <span
                                className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${step.state === "done"
                                    ? "border-emerald-700 bg-emerald-700 text-white"
                                    : step.state === "current"
                                        ? "border-primary bg-background"
                                        : "border-border bg-background"
                                    }`}
                            >
                                {step.state === "done" && <Check className="h-3.5 w-3.5" />}
                                {step.state === "current" && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                            </span>
                            <div className="min-w-0">
                                <p className={`font-medium ${step.state === "upcoming" ? "text-muted-foreground" : "text-foreground"}`}>
                                    {step.label}
                                    <span className="sr-only">
                                        {step.state === "done" ? " (voltooid)" : step.state === "current" ? " (bezig)" : " (nog niet)"}
                                    </span>
                                </p>
                                {step.date && (
                                    <p className="text-xs text-muted-foreground">{dateFormatter.format(new Date(step.date))}</p>
                                )}
                                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                                {step.trackingCode && (
                                    <p className="mt-1 text-sm">
                                        Trackingcode:{" "}
                                        <span className="font-mono font-medium select-all">{step.trackingCode}</span>
                                    </p>
                                )}
                            </div>
                        </li>
                    )
                })}
            </ol>
        </section>
    )
}
