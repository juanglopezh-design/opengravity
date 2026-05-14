import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContentFlow AI — Genera contenido viral en 10 segundos",
  description: "La plataforma de IA más potente para crear contenido de redes sociales, blogs y emails. Genera contenido profesional al instante con inteligencia artificial.",
  keywords: "generador de contenido IA, inteligencia artificial, redes sociales, marketing de contenido, SaaS",
  openGraph: {
    title: "ContentFlow AI",
    description: "Genera contenido viral en 10 segundos con IA",
    type: "website",
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
