import React, { useState } from 'react';
import type { LotteryConfig, PredictedTicket } from '../types/lottery';
import { Sparkles, Copy, Check, Info, ShieldCheck, Star, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TicketDisplayProps {
  tickets: PredictedTicket[];
  config: LotteryConfig;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export const TicketDisplay: React.FC<TicketDisplayProps> = ({
  tickets,
  config,
  onRegenerate,
  isGenerating,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedRationale, setExpandedRationale] = useState<Record<string, boolean>>({});

  const handleCopy = async (ticket: PredictedTicket) => {
    let text = '';
    if (config.id === 'medellin') {
      text = `Lotería de Medellín: Número [${ticket.mainNumbers.join('')}] - Serie [${ticket.extraNumbers[0]?.toString().padStart(3, '0')}]`;
    } else if (config.id === 'nacional') {
      text = `Lotería Nacional de España: Décimo [${ticket.mainNumbers.join('')}] - Serie [${ticket.extraNumbers[0]}] (Confianza: ${ticket.confidence}%)`;
    } else {
      text = `${config.name}: [${ticket.mainNumbers.join(', ')}] + ${config.extraLabel}: [${ticket.extraNumbers.join(', ')}] (Confianza: ${ticket.confidence}%)`;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Android WebView can block Clipboard API — silently ignore
    }
    setCopiedId(ticket.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleRationale = (id: string) => {
    setExpandedRationale((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#facc15', '#a855f7', '#06b6d4', '#ffffff'],
    });
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-3xl bg-cosmos-900/40 border border-white/10">
        <Sparkles className="w-12 h-12 text-amber-400/60 mx-auto mb-4 animate-pulse" />
        <h3 className="text-xl font-display font-bold text-white mb-2">
          Listo para el Análisis Cuántico de {config.name}
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Pulsa el botón a continuación para que el bot inicie la calibración astral, estadística y numerológica en vivo.
        </p>
        <button
          onClick={() => {
            onRegenerate();
            triggerConfetti();
          }}
          disabled={isGenerating}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-purple-600 text-cosmos-950 font-display font-black text-base shadow-gold-glow hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-5 h-5 text-cosmos-950" />
          Ejecutar Análisis y Generar Boletos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <span>Boletos Ganadores Sintetizados</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/30">
              ALTA PROBABILIDAD
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Optimizados para {config.name} con equilibrio simétrico y resonancia celeste.
          </p>
        </div>

        <button
          onClick={() => {
            onRegenerate();
            triggerConfetti();
          }}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-cosmos-950 font-display font-bold text-sm shadow-gold-glow transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? 'Calculando...' : 'Regenerar Combinaciones'}
        </button>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-5">
        {tickets.map((ticket, index) => {
          const isExpanded = !!expandedRationale[ticket.id];

          return (
            <div
              key={ticket.id}
              className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-b from-cosmos-900/90 via-cosmos-900/60 to-cosmos-950/90 border border-white/10 hover:border-amber-400/40 transition-all shadow-xl"
            >
              {/* Ticket Top bar */}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-mono font-bold text-xs">
                    #{index + 1}
                  </span>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      BOLETO {ticket.id}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {ticket.cosmicSign}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{ticket.confidence}% CONFIANZA</span>
                  </div>

                  <button
                    onClick={() => handleCopy(ticket)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                    title="Copiar combinación"
                  >
                    {copiedId === ticket.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Number Balls Display */}
              <div className="py-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                
                {/* Main Numbers */}
                {config.formatMainAsDigits ? (
                  // Medellin (4 digits) or Nacional (5 digits)
                  <div className="flex items-center gap-2 bg-cosmos-950/70 p-2.5 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">
                      {config.id === 'nacional' ? 'Décimo:' : 'Premio Mayor:'}
                    </span>
                    {ticket.mainNumbers.map((digit, i) => (
                      <div
                        key={i}
                        className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center text-white font-mono font-black text-2xl sm:text-3xl shadow-lg border ${
                          config.id === 'nacional'
                            ? 'bg-gradient-to-b from-rose-500 to-red-600 border-rose-300/40 shadow-rose-500/20'
                            : 'ball-glow-cyan border-cyan-200/40'
                        }`}
                      >
                        {digit}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Euromillones or Primitiva
                  ticket.mainNumbers.map((num) => (
                    <div
                      key={num}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full ball-glow-violet flex items-center justify-center text-white font-display font-black text-lg sm:text-xl shadow-lg border border-purple-200/40 transform hover:scale-110 transition-transform"
                    >
                      {num}
                    </div>
                  ))
                )}

                {/* Extra separator */}
                {ticket.extraNumbers.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-px bg-white/20 mx-1 hidden sm:block" />
                    <span className="text-xs font-mono text-amber-300/80 uppercase font-semibold">
                      {config.extraLabel}:
                    </span>

                    {/* Extra numbers (Stars, Reintegro, Serie) */}
                    {ticket.extraNumbers.map((extraNum, idx) => (
                      <div
                        key={idx}
                        className={`ball-glow-gold text-cosmos-950 font-display font-black flex items-center justify-center shadow-lg border border-amber-100/50 transform hover:scale-110 transition-transform ${
                          config.formatSerie
                            ? 'px-4 h-12 sm:h-14 rounded-xl text-xl sm:text-2xl font-mono'
                            : config.id === 'nacional'
                            ? 'w-11 h-11 sm:w-13 sm:h-13 rounded-2xl text-lg sm:text-xl font-mono'
                            : 'w-11 h-11 sm:w-13 sm:h-13 rounded-full text-base sm:text-lg'
                        }`}
                      >
                        {config.id === 'euromillones' && <Star className="w-3 h-3 fill-cosmos-950 mr-0.5" />}
                        {config.formatSerie
                          ? extraNum.toString().padStart(3, '0')
                          : extraNum}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Affinity Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-5 pt-4 border-t border-white/10 text-center">
                <div className="p-2 rounded-xl bg-cosmos-950/40">
                  <span className="text-[10px] font-mono text-purple-300 uppercase block">
                    Afinidad Astral
                  </span>
                  <span className="text-sm sm:text-base font-display font-bold text-white">
                    {ticket.astralAffinity}%
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-cosmos-950/40">
                  <span className="text-[10px] font-mono text-cyan-300 uppercase block">
                    Frecuencia Histórica
                  </span>
                  <span className="text-sm sm:text-base font-display font-bold text-white">
                    {ticket.mathematicalAffinity}%
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-cosmos-950/40">
                  <span className="text-[10px] font-mono text-amber-300 uppercase block">
                    Armonía Vibracional
                  </span>
                  <span className="text-sm sm:text-base font-display font-bold text-white">
                    {ticket.vibrationalHarmony}%
                  </span>
                </div>
              </div>

              {/* Rationale Toggle */}
              <div className="mt-3">
                <button
                  onClick={() => toggleRationale(ticket.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    Por qué el bot seleccionó estos números (Justificación Algorítmica)
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-2 p-4 rounded-xl bg-cosmos-950/80 border border-white/10 text-xs text-slate-300 space-y-2 animate-fade-in">
                    <div className="font-semibold text-amber-300 mb-1">
                      {ticket.rationale.title}
                    </div>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                      {ticket.rationale.details.map((detail, dIdx) => (
                        <li key={dIdx} className="leading-relaxed">
                          <span className="text-slate-200">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
