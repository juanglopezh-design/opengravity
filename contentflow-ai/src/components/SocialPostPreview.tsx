"use client";

import { useState } from "react";

interface SocialPostPreviewProps {
  content: string;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  defaultPlatform?: "linkedin" | "twitter" | "email" | "instagram";
}

export default function SocialPostPreview({
  content,
  authorName = "ContentFlow AI User",
  authorHandle = "creator_pro",
  authorAvatar = "🚀",
  defaultPlatform = "linkedin",
}: SocialPostPreviewProps) {
  const [platform, setPlatform] = useState<"linkedin" | "twitter" | "email" | "instagram">(defaultPlatform);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedContent = content || "Tu contenido generado aparecerá aquí con vista previa en tiempo real...";

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0D1224]/80 backdrop-blur-xl p-5 shadow-2xl text-left font-sans">
      {/* Platform Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setPlatform("linkedin")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              platform === "linkedin"
                ? "bg-[#0A66C2] text-white shadow-md shadow-blue-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>💼</span> LinkedIn
          </button>
          <button
            type="button"
            onClick={() => setPlatform("twitter")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              platform === "twitter"
                ? "bg-white text-black shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>𝕏</span> Twitter / X
          </button>
          <button
            type="button"
            onClick={() => setPlatform("instagram")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              platform === "instagram"
                ? "bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>📸</span> Instagram
          </button>
          <button
            type="button"
            onClick={() => setPlatform("email")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              platform === "email"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>✉️</span> Newsletter
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5"
        >
          {copied ? "✓ Copiado" : "📋 Copiar texto"}
        </button>
      </div>

      {/* ── LINKEDIN MOCKUP ── */}
      {platform === "linkedin" && (
        <div className="bg-[#1B1F23] rounded-xl border border-white/10 p-4 text-gray-200 text-sm leading-relaxed">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-inner">
              {authorAvatar}
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-1">
                {authorName}
                <span className="text-[10px] text-gray-400 bg-white/10 px-1.5 py-0.5 rounded">1st</span>
              </div>
              <div className="text-xs text-gray-400">Content Creator & Founder • 1h • 🌐</div>
            </div>
          </div>
          
          <div className="whitespace-pre-wrap font-normal text-gray-100 text-[13.5px] leading-relaxed mb-4">
            {formattedContent}
          </div>

          <div className="border-t border-white/10 pt-2 flex items-center justify-between text-xs text-gray-400 font-medium">
            <div className="flex items-center gap-1 text-blue-400">
              <span>👍💡❤️ 142</span>
            </div>
            <div>28 comentarios • 12 veces compartido</div>
          </div>

          <div className="border-t border-white/10 mt-2 pt-2 flex justify-around text-xs text-gray-400 font-medium">
            <span className="cursor-pointer hover:text-white flex items-center gap-1">👍 Me gusta</span>
            <span className="cursor-pointer hover:text-white flex items-center gap-1">💬 Comentar</span>
            <span className="cursor-pointer hover:text-white flex items-center gap-1">🔄 Recompartir</span>
            <span className="cursor-pointer hover:text-white flex items-center gap-1">✈️ Enviar</span>
          </div>
        </div>
      )}

      {/* ── TWITTER / X MOCKUP ── */}
      {platform === "twitter" && (
        <div className="bg-black rounded-xl border border-white/15 p-4 text-gray-100 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-lg font-bold text-white">
              {authorAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">{authorName}</span>
                <span className="text-blue-400">✓</span>
                <span className="text-xs text-gray-500">@{authorHandle} • 2m</span>
              </div>

              <div className="whitespace-pre-wrap text-gray-200 text-sm mt-1 leading-relaxed">
                {formattedContent}
              </div>

              <div className="flex items-center justify-between text-gray-500 text-xs mt-4 max-w-md">
                <span className="hover:text-blue-400 flex items-center gap-1 cursor-pointer">💬 24</span>
                <span className="hover:text-green-400 flex items-center gap-1 cursor-pointer">🔄 89</span>
                <span className="hover:text-pink-500 flex items-center gap-1 cursor-pointer">❤️ 412</span>
                <span className="hover:text-blue-400 flex items-center gap-1 cursor-pointer">📊 12.4K</span>
                <span className="hover:text-blue-400 cursor-pointer">🔖</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── INSTAGRAM CAROUSEL MOCKUP ── */}
      {platform === "instagram" && (
        <div className="bg-[#121212] rounded-xl border border-white/10 p-4 text-gray-100 text-sm max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs">
                  {authorAvatar}
                </div>
              </div>
              <span className="font-bold text-xs text-white">{authorHandle}</span>
            </div>
            <span className="text-gray-400 text-xs">•••</span>
          </div>

          <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-white/10 rounded-lg p-5 aspect-square flex flex-col justify-between text-center shadow-inner">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-widest">ContentFlow AI</span>
            <p className="text-white font-bold text-base leading-snug line-clamp-6">
              {content ? content.slice(0, 180) + (content.length > 180 ? "..." : "") : "Crea carruseles virales en segundos."}
            </p>
            <span className="text-[10px] text-gray-400">Desliza para ver más 👉</span>
          </div>

          <div className="flex items-center justify-between mt-3 text-lg">
            <div className="flex items-center gap-3">
              <span className="cursor-pointer hover:opacity-80">❤️</span>
              <span className="cursor-pointer hover:opacity-80">💬</span>
              <span className="cursor-pointer hover:opacity-80">✈️</span>
            </div>
            <span className="cursor-pointer hover:opacity-80 text-sm">🔖</span>
          </div>
        </div>
      )}

      {/* ── EMAIL NEWSLETTER MOCKUP ── */}
      {platform === "email" && (
        <div className="bg-white text-gray-800 rounded-xl p-5 text-sm shadow-xl font-sans">
          <div className="border-b border-gray-200 pb-3 mb-3 text-xs text-gray-500">
            <div><strong className="text-gray-700">De:</strong> {authorName} &lt;newsletter@{authorHandle}.com&gt;</div>
            <div><strong className="text-gray-700">Para:</strong> Suscriptores VIP &lt;subscriber@domain.com&gt;</div>
            <div><strong className="text-gray-700">Asunto:</strong> ⚡ {content ? content.split('\n')[0].slice(0, 60) : "Tu edición semanal de estrategia..."}</div>
          </div>

          <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
            {formattedContent}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
            Enviado con ContentFlow AI • <span className="underline cursor-pointer">Cancelar suscripción</span>
          </div>
        </div>
      )}
    </div>
  );
}
