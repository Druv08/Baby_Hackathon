import type { Metadata, Viewport } from "next";
import { Caveat, Nunito } from "next/font/google";
import "./globals.css";

import { CharacterAmbience } from "@/components/site/CharacterAmbience";
import { CursorTrail } from "@/components/site/CursorTrail";
import { ChaosMode } from "@/components/site/ChaosMode";
import { PaletteTheme } from "@/components/site/PaletteTheme";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SITE_CONFIG } from "@/data/site-config";

const caveat = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-caveat", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  title: { default: SITE_CONFIG.title, template: `%s · ${SITE_CONFIG.name}` },
  description: SITE_CONFIG.description,
};

export const viewport: Viewport = {
  themeColor: "#fff8f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${caveat.variable} ${nunito.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <PaletteTheme />
        <ChaosMode />
        <main id="main">{children}</main>
        <SiteFooter />
        <CharacterAmbience />
        <CursorTrail />
      </body>
    </html>
  );
}
