import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://contentflow-ai-ex6w.onrender.com";
const siteTitle = "ContentFlow AI";
const siteDescription =
  "La plataforma de IA para crear posts, emails y blogs listos para publicar en segundos.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteTitle} - Genera contenido viral en 10 segundos`,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  keywords: [
    "generador de contenido IA",
    "inteligencia artificial",
    "redes sociales",
    "marketing de contenido",
    "SaaS",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteTitle} - Genera contenido viral en 10 segundos`,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    type: "website",
    locale: "es_ES",
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
    title: `${siteTitle} - Genera contenido viral en 10 segundos`,
    description: siteDescription,
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
