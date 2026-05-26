import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta gratis en ContentFlow AI.",
  alternates: { canonical: "/signup" },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
