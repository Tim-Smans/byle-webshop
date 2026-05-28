import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Geist,
  Geist_Mono,
  Old_Standard_TT,
} from "next/font/google";

import localFont from "next/font/local";

import "./globals.css";
import { cn } from "@/lib/utils";

import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { UnderConstructionPopup } from "@/components/temp/underConstruction";
import { FavoritesProvider } from "@/lib/context/favorites-context";
import CartDrawer from "@/components/cart/favorites-drawer";
import { FeedbackProvider } from "@/lib/context/feedback-context";

const oldStandard = Old_Standard_TT({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fontHeading = Cormorant_Garamond(
  {
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-heading",
  })

const amoresa = localFont({
  src: [
    {
      path: "../public/fonts/amoresa-aged.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-decorative",
});

export const metadata: Metadata = {
  title: "Art By Lé",
  description: "Art By Lé galery app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-body",
        geistSans.variable,
        geistMono.variable,
        oldStandard.variable,
        fontHeading.variable,
        amoresa.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <FavoritesProvider>
          <FeedbackProvider>
            <Header />
            {children}
            <Footer />
            <CartDrawer />
          </FeedbackProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}