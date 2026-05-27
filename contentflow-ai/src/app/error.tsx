"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

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
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚠️</div>
      <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
        Algo salió mal
      </h1>
      <p style={{ color: "var(--text-secondary, #94a3b8)", marginBottom: "32px", maxWidth: "400px" }}>
        Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: "10px",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "#f1f5f9",
            padding: "12px 28px",
            borderRadius: "10px",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "15px",
          }}
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
