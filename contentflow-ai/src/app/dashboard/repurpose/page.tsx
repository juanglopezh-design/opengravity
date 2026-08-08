"use client";

import { useState } from "react";
import SocialPostPreview from "@/components/SocialPostPreview";
import Link from "next/link";

interface BundleData {
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
  email?: string;
}

export default function RepurposePage() {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("Español");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bundle, setBundle] = useState<BundleData | null>(null);
  const [activeTab, setActiveTab] = useState<"linkedin" | "twitter" | "tiktok" | "email">("linkedin");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError("");
    setBundle(null);

    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic, language }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al transformar el contenido");
      }

      setBundle(data.bundle);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6 text-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <span>⚡ 1-Click Multi-Asset Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Transformador Omnicanal
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Convierte 1 idea o texto en un paquete completo de 4 publicaciones para LinkedIn, X, TikTok y Email Newsletter.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          &larr; Volver al Dashboard
        </Link>
      </div>

      {/* Input Form */}
      <div className="bg-[#0D1224]/90 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Idea, Artículo o Transcripción Principal
            </label>
            <textarea
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: 5 errores que cometen los fundadores al lanzar su primer SaaS y cómo evitarlos con automatización..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all text-sm leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-400 font-medium">Idioma de destino:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-black/50 border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-purple-500"
              >
                <option value="Español">Español</option>
                <option value="Inglés">Inglés</option>
                <option value="Portugués">Portugués</option>
                <option value="Francés">Francés</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Transformando en 4 formatos...
                </>
              ) : (
                <>
                  <span>🚀</span> Generar Paquete Omnicanal
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              ⚠️ {error}
            </div>
          )}
        </form>
      </div>

      {/* Output Section */}
      {bundle && (
        <div className="space-y-6 fade-in-up">
          {/* Output Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab("linkedin")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === "linkedin"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <span>💼</span> LinkedIn Post
            </button>
            <button
              onClick={() => setActiveTab("twitter")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === "twitter"
                  ? "bg-white text-black shadow-lg"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <span>𝕏</span> Hilo de X
            </button>
            <button
              onClick={() => setActiveTab("tiktok")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === "tiktok"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <span>🎬</span> Guión TikTok/Shorts
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === "email"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <span>✉️</span> Email Newsletter
            </button>
          </div>

          {/* Active Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="bg-[#0D1224] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Texto Generado ({activeTab.toUpperCase()})
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(bundle[activeTab] || "")}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
                >
                  📋 Copiar
                </button>
              </div>

              <textarea
                readOnly
                rows={14}
                value={bundle[activeTab] || ""}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-200 leading-relaxed outline-none resize-none"
              />
            </div>

            {/* Social Live Render Preview */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                Vista Previa Realista en Redes Sociales
              </span>
              <SocialPostPreview
                content={bundle[activeTab] || ""}
                defaultPlatform={activeTab === "tiktok" ? "instagram" : activeTab}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
