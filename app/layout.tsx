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
import { FavoritesProvider } from "@/lib/context/favorites-context";
import { Analytics } from "@vercel/analytics/next"
import FavoritesDrawer from "@/components/cart/favorites-drawer";
import CartDrawer from "@/components/cart/cart-drawer";
import { CartProvider } from "@/lib/context/cart-context";
import { FeedbackProvider } from "@/lib/context/feedback-context";
import AnnouncementBar from "@/components/announcements/announcement-bar";
import { getAnnouncementBanner } from "@/lib/announcements/banner";
import { BANNER_DISMISSED_KEY, BANNER_HIDDEN_ATTRIBUTE } from "@/lib/announcements/types";

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
  title: "Art by Lé",
  description: "Art by Lé galery app"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const banner = await getAnnouncementBanner();

  return (
    <html
      // The banner script below may set an attribute before hydration
      suppressHydrationWarning
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
        {banner && (
          // Runs while the page is parsed, before the banner paints: hides it
          // when the visitor closed this version of the banner
          <script
            dangerouslySetInnerHTML={{
              __html: `try{if(localStorage.getItem(${JSON.stringify(BANNER_DISMISSED_KEY)})===${JSON.stringify(banner.version)})document.documentElement.setAttribute(${JSON.stringify(BANNER_HIDDEN_ATTRIBUTE)},"")}catch(e){}`,
            }}
          />
        )}
        <Analytics/>
        <CartProvider>
          <FavoritesProvider>
            <FeedbackProvider>
              <Header banner={banner ? <AnnouncementBar banner={banner} /> : null} />
              {/* Pushes the page down by the height of the banner */}
              {banner && <div className="announcement-spacer shrink-0" aria-hidden />}
              {children}
              <Footer />
              <FavoritesDrawer />
              <CartDrawer />
            </FeedbackProvider>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}