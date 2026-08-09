import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import ReferralTracker from "@/components/ReferralTracker";
import KeepAlive from "@/components/KeepAlive";

import { siteUrl } from "@/lib/config";
const siteTitle = "ContentFlow AI";
const siteDescription =
  "La plataforma de generación de contenido con IA más avanzada en español e inglés. The most advanced AI content generator platform in English and Spanish.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteTitle} - Genera contenido viral en 10 segundos | Generate viral content in 10 seconds`,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  keywords: [
    "generador de contenido IA",
    "inteligencia artificial",
    "redes sociales",
    "marketing de contenido",
    "AI content generator",
    "content creation AI",
    "SaaS",
    "Bitcoin SaaS",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteTitle} - Genera contenido viral | Generate viral content`,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_ES"],
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "ContentFlow AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteTitle} - Genera contenido viral | Generate viral content`,
    description: siteDescription,
    images: ["/og-image.svg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ContentFlow AI",
  "operatingSystem": "All",
  "applicationCategory": "BusinessApplication",
  "description": "La plataforma de generación de contenido con IA más avanzada en español e inglés. The most advanced AI content generator platform in English and Spanish.",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "1.99",
    "highPrice": "79.00",
    "offerCount": "4"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "128"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LanguageProvider>
          <KeepAlive />
          <ReferralTracker />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

