import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Buying in Dubai Creek Harbour — independent buyer's guide | DXB Creek Harbour",
    template: "%s | DXB Creek Harbour",
  },
  description:
    "Thinking of buying in Dubai Creek Harbour? An independent guide to the district — living there, getting around, what's being built and what to check before you offer — and help finding the right home.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_AE",
    url: SITE.url,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1733",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable}`}>
      <body className="min-h-dvh">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
