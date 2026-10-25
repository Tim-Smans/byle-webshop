import type { ReactNode } from "react"

// Small building blocks for the handleiding (/docs), in the site's style

export function Topic({ id, title, children }: { id: string; title: string; children: ReactNode }) {
    return (
        <section id={id} className="scroll-mt-28 py-6 border-b border-border last:border-0">
            <h3 className="font-heading text-2xl sm:text-3xl text-foreground mb-3 text-balance">{title}</h3>
            <div className="space-y-3 text-foreground/90 leading-relaxed">{children}</div>
        </section>
    )
}

export function SubTitle({ children }: { children: ReactNode }) {
    return <h4 className="pt-2 text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground">{children}</h4>
}

export function Steps({ children }: { children: ReactNode }) {
    return <ol className="list-decimal pl-6 space-y-2 marker:font-semibold marker:text-oker">{children}</ol>
}

export function Bullets({ children }: { children: ReactNode }) {
    return <ul className="list-disc pl-6 space-y-2">{children}</ul>
}

// A button or label exactly as it appears on the site
export function Ui({ children }: { children: ReactNode }) {
    return <span className="font-semibold whitespace-nowrap border-b border-dotted border-muted-foreground">{children}</span>
}

export function Note({ children }: { children: ReactNode }) {
    return <div className="rounded-md bg-muted/60 px-4 py-3 text-sm">{children}</div>
}

export function Warn({ children }: { children: ReactNode }) {
    return <div className="rounded-md bg-red-50 text-red-900 px-4 py-3 text-sm">{children}</div>
}

export function Flow({ steps }: { steps: string[] }) {
    return (
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
            {steps.map((step, index) => (
                <span key={step} className="flex items-center gap-1.5">
                    {index > 0 && <span className="text-muted-foreground" aria-hidden>→</span>}
                    <span className="rounded-full border border-oker px-3 py-0.5 font-medium text-oker">{step}</span>
                </span>
            ))}
        </div>
    )
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                        {head.map((cell) => (
                            <th key={cell} className="py-2 pr-4 font-semibold">{cell}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index} className="border-b border-border last:border-0 align-top">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="py-2 pr-4">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export function PartHeader({ id, eyebrow, title, intro }: { id: string; eyebrow: string; title: string; intro: string }) {
    return (
        <div id={id} className="scroll-mt-24 border-b-2 border-oker pb-4 mb-2">
            <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-2">{eyebrow}</p>
            <h2 className="text-oker text-4xl font-light tracking-tight">{title}</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">{intro}</p>
        </div>
    )
}

export function TopicIndex({ label, items }: { label: string; items: { id: string; title: string }[] }) {
    return (
        <nav aria-label={label} className="lg:sticky lg:top-32 self-start text-sm">
            <ol className="flex flex-wrap gap-x-4 gap-y-1.5 lg:flex-col lg:gap-2">
                {items.map((item) => (
                    <li key={item.id}>
                        <a href={`#${item.id}`} className="text-muted-foreground hover:text-oker transition-colors">
                            {item.title}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    )
}
