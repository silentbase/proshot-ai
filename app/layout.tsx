import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardHeaderTailwind from "@/components/dashboard/DashboardHeaderTailwind";
import Footer from "@/components/layout/Footer";
import { AppProvider } from "@/contexts/AppContext";

import CreditPurchaseModal from "@/components/dashboard/CreditPurchaseModal";
import { Toaster } from "sonner";
import { GenerationProvider } from "@/contexts/GenerationContext";
import CookieConsent from "@/components/CookieConsent";
import { ConditionalStripeScript } from "@/components/ConditionalStripeScript";
import { CreditsProvider } from "@/contexts/CreditsContext";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ProShot AI - Erstellen Sie kreative Werbeanzeigen mit KI",
    template: "%s | ProShot AI"
  },
  description: "Generieren Sie professionelle Werbeanzeigen und Produktbilder mit künstlicher Intelligenz. Schnell, einfach und kreativ - perfekt für Marketing und E-Commerce.",
  keywords: ["AI", "Werbung", "Ad Generator", "KI", "Bildgenerierung", "Marketing", "E-Commerce", "Produktbilder", "Künstliche Intelligenz", "ProShot AI"],
  authors: [{ name: "ProShot AI" }],
  creator: "ProShot AI",
  publisher: "ProShot AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteUrl,
    title: "ProShot AI - Erstellen Sie kreative Werbeanzeigen mit KI",
    description: "Generieren Sie professionelle Werbeanzeigen und Produktbilder mit künstlicher Intelligenz. Schnell, einfach und kreativ.",
    siteName: "ProShot AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProShot AI - Erstellen Sie kreative Werbeanzeigen mit KI",
    description: "Generieren Sie professionelle Werbeanzeigen und Produktbilder mit künstlicher Intelligenz.",
    creator: "@proshotai",
  },
  verification: {
    // Add your verification codes here when available
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
    // bing: 'msvalidate.01-code',
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="theme-purple dark">
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "ProShot AI",
              "description": "Generieren Sie professionelle Werbeanzeigen und Produktbilder mit künstlicher Intelligenz",
              "url": siteUrl,
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR"
              },
              "featureList": [
                "KI-gestützte Bildgenerierung",
                "Werbeanzeigen erstellen",
                "Produktbilder generieren",
                "Kredit-basiertes System"
              ]
            })
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <Toaster position="top-center"></Toaster>
        <ConditionalStripeScript />
        <AppProvider>
          <GenerationProvider>
            <CreditsProvider>
              <CreditPurchaseModal />
              <DashboardHeaderTailwind />
              {children}
              <Footer />
            </CreditsProvider>
          </GenerationProvider>
        </AppProvider>
        <CookieConsent />
      </body>

    </html >
  );
};

