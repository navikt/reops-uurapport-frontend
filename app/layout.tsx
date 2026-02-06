import type { Metadata, Viewport } from "next";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import styles from "./layout.module.css";
import Script from "next/script";
import "@navikt/ds-css";
import "./globals.css";

export const metadata: Metadata = {
  title: "uurapport rapportering",
  description:
    "NAVs interne rapporteringsverktøy for tilgjengelighetserklæringer",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <head>
        {/* Analytics script */}
        <Script
          src="https://cdn.nav.no/team-researchops/sporing/sporing.js"
          data-host-url="https://umami.nav.no"
          data-website-id="d4ae85db-d511-44ed-94bf-60e424bf67e3"
          strategy="afterInteractive"
        />
      </head>
      <body className="body">
        <Navbar />
        <main className={styles.main}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
