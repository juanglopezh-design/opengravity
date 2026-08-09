"use client";

import { useEffect } from "react";

/**
 * Componente invisible que hace ping al servidor cada 9 minutos
 * mientras el usuario tiene la app abierta en el navegador.
 * Esto evita el cold start de Render en el plan gratuito.
 */
export default function KeepAlive() {
  useEffect(() => {
    const INTERVAL_MS = 9 * 60 * 1000; // 9 minutos

    const ping = async () => {
      try {
        await fetch("/api/health", { method: "GET", cache: "no-store" });
      } catch {
        // Silenciar errores — si falla el ping no es crítico
      }
    };

    // Primer ping inmediato al cargar
    ping();

    const interval = setInterval(ping, INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
}
