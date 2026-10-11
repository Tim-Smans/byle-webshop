import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { WITHDRAWAL_FORM } from "@/lib/legal/withdrawal-form";
import PrintButton from "@/components/withdrawal/print-button";

export const metadata: Metadata = {
    title: "Modelformulier voor herroeping | Art by Lé",
};

export default function ModelformulierPage() {
    return (
        <main className="min-h-screen pt-32 pb-24 print:pt-0 print:pb-0">
            <div className="mx-auto max-w-2xl px-6 lg:px-8">
                <div className="mb-8 flex flex-wrap gap-3 print:hidden">
                    <PrintButton />
                    <a
                        href="/herroeping/modelformulier/pdf"
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-card transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Download als PDF
                    </a>
                </div>

                <p className="mb-8 text-sm text-muted-foreground print:hidden">
                    Je kan ook rechtstreeks online herroepen via{" "}
                    <Link href="/herroepen" className="underline underline-offset-4 hover:text-foreground">
                        Bestelling herroepen
                    </Link>
                    .
                </p>

                <article className="bg-card border border-border rounded-lg p-8 print:border-0 print:p-0 print:bg-transparent">
                    <h1 className="text-xl font-semibold mb-4">{WITHDRAWAL_FORM.title}</h1>
                    <p className="mb-4">{WITHDRAWAL_FORM.intro}</p>

                    <p>Aan:</p>
                    <address className="not-italic mb-4">
                        {WITHDRAWAL_FORM.recipient.map((line) => (
                            <span key={line} className="block">{line}</span>
                        ))}
                    </address>

                    <p className="mb-4">{WITHDRAWAL_FORM.statement}</p>

                    {WITHDRAWAL_FORM.fields.map((field) => (
                        <div key={field.label} className="mt-5">
                            <p>{field.label}</p>
                            {field.note && <p className="text-sm text-muted-foreground">{field.note}</p>}
                            {Array.from({ length: field.lines }, (_, index) => (
                                <div key={index} className="mt-6 border-b border-dotted border-foreground/40" />
                            ))}
                        </div>
                    ))}

                    <p className="mt-8 text-sm">{WITHDRAWAL_FORM.footnote}</p>
                </article>
            </div>
        </main>
    );
}
