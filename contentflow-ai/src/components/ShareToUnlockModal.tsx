"use client";

import { useState } from "react";
import Link from "next/link";
import { siteUrl } from "@/lib/config";

interface ShareToUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: (newCount: number) => void;
}

export default function ShareToUnlockModal({ isOpen, onClose, onUnlocked }: ShareToUnlockModalProps) {
  const [unlocked, setUnlocked] = useState(false);

  if (!isOpen) return null;

  const handleShareOnTwitter = () => {
    const shareText = encodeURIComponent(
      "¡Probé @ContentFlowAI para generar publicaciones virales en 10 segundos con Gemini! 🚀 Pruébalo gratis aquí:"
    );
    const shareUrl = encodeURIComponent(`${siteUrl}/signup?ref=viral_share`);
    const twitterIntent = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;

    window.open(twitterIntent, "_blank", "width=600,height=400");

    // Grant +2 free generations in client storage
    const current = Number(localStorage.getItem("cf_remaining_demos") || 0);
    const updated = current + 2;
    localStorage.setItem("cf_remaining_demos", String(updated));

    setUnlocked(true);
    setTimeout(() => {
      onUnlocked(updated);
      onClose();
      setUnlocked(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0D1224] border border-purple-500/30 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl space-y-5 text-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg"
        >
          ✕
        </button>

        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
          🎁
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-white">
            ¡Desbloquea +2 Generaciones Gratis!
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Has alcanzado tus demostraciones gratuitas. Comparte ContentFlow AI en X (Twitter) para desbloquear inmediatamente **2 generaciones adicionales sin costo**.
          </p>
        </div>

        {unlocked ? (
          <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-sm font-bold flex items-center justify-center gap-2">
            <span>🎉</span> ¡+2 Generaciones Añadidas! Cargando...
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <button
              onClick={handleShareOnTwitter}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-white text-black hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>𝕏</span> Compartir en X (+2 Créditos Gratis)
            </button>

            <div className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">O</div>

            <Link
              href="/signup"
              className="block w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
            >
              Crear Cuenta Gratis e Ilimitada
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
