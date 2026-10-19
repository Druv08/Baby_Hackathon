import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { CharacterAmbience } from "@/components/site/CharacterAmbience";
import { CursorTrail } from "@/components/site/CursorTrail";
import { ChaosMode } from "@/components/site/ChaosMode";
import { PaletteTheme } from "@/components/site/PaletteTheme";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SITE_CONFIG } from "@/data/site-config";

const caveat = localFont({ src: "../../public/fonts/caveat-latin.woff2", weight: "500 700", variable: "--font-caveat", display: "swap", preload: false });
const nunito = localFont({ src: "../../public/fonts/nunito-latin.woff2", weight: "400 800", variable: "--font-nunito", display: "swap" });

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
    <html lang="en" suppressHydrationWarning className={`${caveat.variable} ${nunito.variable}`}>
      <head>
        {/* Constant, trusted bootstrap runs before paint, using the existing preference key. */}
        <script>{"try{document.documentElement.dataset.palette=localStorage.getItem('maria:night-palette')==='on'?'night':'day'}catch{}"}</script>
      </head>
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
