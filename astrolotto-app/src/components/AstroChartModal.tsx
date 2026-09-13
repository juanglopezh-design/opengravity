import React from 'react';
import type { AstroInfluence, NumerologyBreakdown, UserAstralProfile } from '../types/lottery';
import { X, Sun, Compass, Orbit, KeyRound } from 'lucide-react';

interface AstroChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  astro: AstroInfluence;
  numerology: NumerologyBreakdown;
  profile: UserAstralProfile;
}

export const AstroChartModal: React.FC<AstroChartModalProps> = ({
  isOpen,
  onClose,
  astro,
  numerology,
  profile,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-cosmos-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-amber-500 p-[1px]">
            <div className="w-full h-full bg-cosmos-950 rounded-[15px] flex items-center justify-center">
              <Orbit className="w-6 h-6 text-purple-300" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
              Efemérides Astrales & Carta Numerológica
            </h2>
            <p className="text-xs text-slate-400">
              Vibraciones celestes calculadas para la fecha del sorteo ({profile.drawDate})
            </p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Moon Phase Card */}
          <div className="p-5 rounded-2xl bg-cosmos-950/70 border border-purple-400/20 flex flex-col sm:flex-row items-center gap-4">
            <div className="text-5xl sm:text-6xl select-none filter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              {astro.moonPhase.icon}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase">
                  Fase Lunar
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  {astro.moonPhase.illumination}% Iluminación
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-white">
                {astro.moonPhase.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {astro.moonPhase.significance}
              </p>
            </div>
          </div>

          {/* Dominant Planet & Zodiac */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Dominant Planet */}
            <div className="p-4 rounded-2xl bg-cosmos-950/70 border border-amber-400/20">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold mb-2">
                <Sun className="w-4 h-4 text-amber-400" />
                PLANETA REGENTE DEL DÍA
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl text-amber-300 font-bold">
                  {astro.dominantPlanet.symbol}
                </span>
                <span className="text-lg font-display font-bold text-white">
                  {astro.dominantPlanet.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                {astro.dominantPlanet.energy}
              </p>
              <div className="text-[11px] font-mono text-slate-400">
                Resonancia numérica:
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {astro.dominantPlanet.resonantNumbers.map((n) => (
                    <span
                      key={n}
                      className="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30 font-bold"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Zodiac Connection */}
            <div className="p-4 rounded-2xl bg-cosmos-950/70 border border-cyan-400/20">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                SIGNO & ELEMENTO NATAL
              </div>
              <div className="text-lg font-display font-bold text-white mb-1">
                {astro.zodiacAspect.sign} · Elemento {astro.zodiacAspect.element}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Vibración: {astro.zodiacAspect.luckyHarmony}
              </p>
              <div className="p-2.5 rounded-xl bg-cosmos-900 border border-white/5 text-[11px] text-cyan-300 font-mono">
                Vibración Celeste del Sorteo: #{astro.celestialVibration}
              </div>
            </div>

          </div>

          {/* Numerology Life Path & Harmonics */}
          <div className="p-5 rounded-2xl bg-cosmos-950/70 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
              <KeyRound className="w-4 h-4 text-amber-400" />
              Matriz Pitagórica de {profile.name || 'Consultor'}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-cosmos-900 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Sendero de Vida</span>
                <span className="text-2xl font-display font-black text-amber-300">#{numerology.lifePath}</span>
              </div>

              <div className="p-3 rounded-xl bg-cosmos-900 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Día Universal</span>
                <span className="text-2xl font-display font-black text-purple-300">#{numerology.universalDayVibration}</span>
              </div>

              <div className="p-3 rounded-xl bg-cosmos-900 border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Día Personal</span>
                <span className="text-2xl font-display font-black text-cyan-300">#{numerology.personalDayNumber}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 block mb-1.5">
                Octavas y Espejos Numéricos Armónicos generados por reducción:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {numerology.harmoniousMatrix.slice(0, 18).map((num) => (
                  <span
                    key={num}
                    className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-300"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
