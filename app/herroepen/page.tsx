import type { Metadata } from "next";
import Link from "next/link";
import { getOrderForCustomer } from "@/lib/orders/order-queries";
import WithdrawalFlow from "@/components/withdrawal/withdrawal-flow";

export const metadata: Metadata = {
    title: "Bestelling herroepen | Art by Lé",
    description: "Herroep een online aankoop binnen de wettelijke bedenktijd van 14 dagen.",
};

export default async function HerroepenPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const orderNumber = typeof params.bestelling === "string" ? params.bestelling : "";
    const token = typeof params.t === "string" ? params.t : "";

    // Coming from the link in an e-mail: fill in what we already know
    const order = orderNumber && token ? await getOrderForCustomer(orderNumber, token) : null;

    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="mx-auto max-w-2xl px-6 lg:px-8">
                <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
                    Herroepingsrecht
                </p>
                <h1 className="text-oker text-4xl sm:text-5xl font-light tracking-tight mb-4">
                    Bestelling herroepen
                </h1>
                <p className="text-muted-foreground mb-2">
                    Heb je online een bestaand kunstwerk gekocht? Dan kan je je aankoop binnen 14 kalenderdagen na
                    ontvangst zonder opgave van reden herroepen. Vul hieronder je gegevens in.
                </p>
                <p className="text-sm text-muted-foreground mb-10">
                    Liever op papier of per e-mail? Gebruik dan het{" "}
                    <Link href="/herroeping/modelformulier" className="underline underline-offset-4 hover:text-foreground">
                        modelformulier voor herroeping
                    </Link>
                    . Voor kunstwerken op maat geldt het herroepingsrecht niet.
                </p>

                <WithdrawalFlow
                    initial={{
                        name: order ? `${order.customerFirstName} ${order.customerLastName}` : "",
                        email: order?.customerEmail ?? "",
                        orderNumber: order?.orderNumber ?? orderNumber,
                        token: order ? token : "",
                    }}
                />
            </div>
        </main>
    );
}
