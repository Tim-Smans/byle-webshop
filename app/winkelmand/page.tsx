import type { Metadata } from "next";
import CartPage from "@/components/cart/cart-page";

export const metadata: Metadata = {
    title: "Winkelmand | Art by Lé",
};

export default function WinkelmandPage() {
    return <CartPage />
}
