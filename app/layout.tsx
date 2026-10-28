import type { Metadata, Viewport } from "next";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Box } from "@navikt/ds-react";
import { PageBlock } from "@/components/layout/PageBlock";
import Script from "next/script";
import "@navikt/ds-css";
import "./globals.css";

export const metadata: Metadata = {
  title: "uurapport rapportering",
  description:
    "Navs interne rapporteringsverktøy for tilgjengelighetserklæringer",
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
    <html lang="nb" suppressHydrationWarning>
      <head>
        {/* Analytics script */}
        <Script
          src="https://cdn.nav.no/team-researchops/sporing/sporing.js"
          data-host-url="https://umami.nav.no"
          data-website-id="d4ae85db-d511-44ed-94bf-60e424bf67e3"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <ThemeProvider>
          <Navbar />
          <Box
            as="main"
            background="sunken"
            paddingBlock={{ xs: "space-16", sm: "space-20" }}
            style={{ flex: 1 }}
          >
            <PageBlock width="xl" gutters>
              <Box
                background="raised"
                padding={{ xs: "space-16", sm: "space-20", md: "space-24" }}
                borderRadius="8"
              >
                {children}
              </Box>
            </PageBlock>
          </Box>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
