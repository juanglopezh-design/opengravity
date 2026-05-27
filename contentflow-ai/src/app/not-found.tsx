import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        background: "var(--bg-primary, #0a0a0f)",
        color: "var(--text-primary, #f1f5f9)",
      }}
    >
      <div style={{ fontSize: "72px", marginBottom: "16px" }}>⚡</div>
      <h1 style={{ fontSize: "48px", fontWeight: 800, marginBottom: "8px" }}>404</h1>
      <p style={{ fontSize: "18px", color: "var(--text-secondary, #94a3b8)", marginBottom: "32px" }}>
        Esta página no existe o fue movida.
      </p>
      <Link
        href="/"
        style={{
          background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
          color: "#fff",
          padding: "14px 32px",
          borderRadius: "10px",
          fontWeight: 700,
          textDecoration: "none",
          fontSize: "16px",
        }}
      >
        Volver al inicio
      </Link>
    </main>
  );
}
