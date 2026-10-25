import type { Metadata } from "next";
import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapShippingRate, type ShippingRate } from "@/lib/shop/shipping";
import { DELIVERY_TIME_TEXT, PICKUP_LOCATION_TEXT } from "@/lib/shop/config";
import CheckoutForm from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
    title: "Afrekenen | Art by Lé",
};

async function getActiveShippingRates(): Promise<ShippingRate[]> {
    const { data, error } = await createAdminClient()
        .from("ShippingRate")
        .select("*")
        .eq("isActive", true)
        .order("countryName", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map(mapShippingRate);
}

export default async function AfrekenenPage() {
    // Shipping rates must be current, never from a build-time prerender
    await connection();
    const rates = await getActiveShippingRates();

    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
                <div className="mb-10">
                    <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
                        Bijna van jou
                    </p>
                    <h1 className="text-oker text-4xl sm:text-5xl font-light tracking-tight">
                        Afrekenen
                    </h1>
                </div>

                <CheckoutForm
                    rates={rates}
                    deliveryTimeText={DELIVERY_TIME_TEXT}
                    pickupLocationText={PICKUP_LOCATION_TEXT}
                />
            </div>
        </main>
    );
}
