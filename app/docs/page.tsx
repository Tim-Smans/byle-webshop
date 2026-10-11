import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth/admin-auth";
import CustomerGuide from "@/components/docs/customer-guide";
import AdminGuide from "@/components/docs/admin-guide";

export const metadata: Metadata = {
    title: "Hoe bestellen? | Art by Lé",
    description: "Alles over bestellen, betalen, levering, annuleren en herroepen bij Art by Lé.",
};

export default async function DocsPage() {
    // The admin part is only rendered on the server for logged-in admins, so
    // it never reaches other visitors (not even in the page source)
    const admin = await isAdmin();

    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
                <div className="mb-10">
                    <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
                        Handleiding
                    </p>
                    <h1 className="text-oker text-4xl sm:text-5xl font-light tracking-tight mb-4">
                        Hoe bestellen?
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Alles over kopen, betalen, levering, annuleren en herroepen in de webshop van Art by Lé.
                    </p>

                    {admin && (
                        <nav aria-label="Delen van de handleiding" className="mt-6 flex flex-wrap gap-2">
                            <a href="#klanten" className="rounded-full border border-oker px-4 py-1.5 text-sm font-medium text-oker">
                                Voor klanten
                            </a>
                            <a href="#admin" className="rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:bg-card">
                                Voor de admin
                            </a>
                        </nav>
                    )}
                </div>

                <div className="space-y-16">
                    <CustomerGuide />
                    {admin && <AdminGuide />}
                </div>
            </div>
        </main>
    );
}
