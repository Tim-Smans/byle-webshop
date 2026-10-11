import type { Metadata } from "next";
import { TermsOfServiceContent } from "@/components/dialogs/service-dialogs";
import { TERMS_LAST_UPDATED } from "@/lib/shop/config";

export const metadata: Metadata = {
    title: "Algemene voorwaarden | Art by Lé",
};

export default function VoorwaardenPage() {
    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
                <p className="text-sm uppercase tracking-[0.3em] text-secondary font-medium mb-3">
                    Legal
                </p>
                <h1 className="text-4xl font-light text-oker mb-2">Algemene voorwaarden</h1>
                <p className="text-muted-foreground mb-2">Laatst bijgewerkt: {TERMS_LAST_UPDATED}</p>
                <a
                    href="/voorwaarden/pdf"
                    className="inline-block mb-10 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                    Download als PDF
                </a>

                <TermsOfServiceContent />
            </div>
        </main>
    );
}
