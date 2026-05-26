import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";

export const metadata: Metadata = {
  title: "Precios",
  description: "Planes de ContentFlow AI para creadores, negocios y agencias.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <main>
      <Navbar />
      <Pricing />
      <Footer />
    </main>
  );
}
