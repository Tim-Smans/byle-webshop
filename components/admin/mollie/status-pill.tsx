import { CheckCircle2, CircleDashed, MinusCircle, XCircle } from "lucide-react"
import { TONE_CLASSES, type StatusTone } from "@/lib/mollie/labels"

const ICONS = {
    good: CheckCircle2,
    progress: CircleDashed,
    neutral: MinusCircle,
    bad: XCircle,
}

// Status shown with icon + label, never color alone
export default function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
    const Icon = ICONS[tone]
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONE_CLASSES[tone]}`}>
            <Icon size={12} aria-hidden />
            {label}
        </span>
    )
}
