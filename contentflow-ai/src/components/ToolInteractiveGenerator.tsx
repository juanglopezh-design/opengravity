"use client";

import { useState } from "react";
import SocialPostPreview from "./SocialPostPreview";
import Link from "next/link";

interface ToolInteractiveGeneratorProps {
  toolTitle: string;
}

export default function ToolInteractiveGenerator({ toolTitle }: ToolInteractiveGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${toolTitle}: ${prompt}`,
          type: "linkedin",
          tone: "professional",
          language: "Español",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al generar contenido demo");
      }

      setResult(data.content);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-12 p-6 md:p-8 bg-[#0D1224] border border-purple-500/30 rounded-2xl shadow-2xl space-y-6">
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
          ⚡ Demo En Vivo Gratis
        </span>
        <span className="text-xs text-gray-400">Prueba instantánea sin registro</span>
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-white">
        Generador En Vivo para {toolTitle}
      </h3>

      <form onSubmit={handleGenerate} className="space-y-4">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe tu tema para ${toolTitle}... (ej. Lanzamiento de nueva función, lecciones aprendidas esta semana)`}
          className="w-full bg-black/50 border border-white/15 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-gray-400">Generaciones de demostración instantáneas habilitadas</span>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Generando con IA..." : "✨ Generar Ahora"}
          </button>
        </div>

        {error && <p className="text-xs text-red-400">⚠️ {error}</p>}
      </form>

      {result && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          <SocialPostPreview content={result} />
          
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <h4 className="font-bold text-white text-sm">¿Te gustó el resultado?</h4>
              <p className="text-xs text-gray-300">Crea publicaciones ilimitadas y prográmalas automáticamente con tu cuenta gratis.</p>
            </div>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#00FF9D] text-black hover:bg-[#00CC7D] transition-colors whitespace-nowrap shadow-lg shadow-green-500/20"
            >
              Crear Cuenta Gratis &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
