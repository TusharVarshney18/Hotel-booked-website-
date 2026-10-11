import type { Metadata } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { COPYRIGHT_CLAIM, SITE_AUTHOR } from "@/lib/site";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aurelia — Private Residences",
    template: "%s · Aurelia",
  },
  description:
    "Shop private palaces, villas and residences. Priced in rupees, paid at checkout, held in your folio.",
  authors: [{ name: SITE_AUTHOR }],
  creator: SITE_AUTHOR,
  other: {
    copyright: COPYRIGHT_CLAIM,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jost.variable} dark h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
