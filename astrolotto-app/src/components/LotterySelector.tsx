import React from 'react';
import { LOTTERY_CONFIGS } from '../data/historicalLotteryData';
import type { LotteryType } from '../types/lottery';
import { Trophy, Calendar, Sparkles } from 'lucide-react';

interface LotterySelectorProps {
  selected: LotteryType;
  onSelect: (type: LotteryType) => void;
}

export const LotterySelector: React.FC<LotterySelectorProps> = ({ selected, onSelect }) => {
  const lotteries: LotteryType[] = ['euromillones', 'primitiva', 'medellin', 'nacional'];

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MOTOR PREDICTIVO TRIPARTITO ACTIVO</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Selecciona la Lotería para el Análisis
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-1">
          El bot calibrará los algoritmos estadísticos, tránsitos astronómicos y matrices de numerología según las reglas del juego.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {lotteries.map((type) => {
          const config = LOTTERY_CONFIGS[type];
          const isSelected = selected === type;

          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`relative overflow-hidden text-left p-5 rounded-2xl transition-all duration-300 group border ${
                isSelected
                  ? 'bg-gradient-to-b from-cosmos-900/90 to-cosmos-800/90 border-amber-400 shadow-gold-glow scale-[1.02]'
                  : 'bg-cosmos-900/50 hover:bg-cosmos-900/80 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Subtle accent glow line at top */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 transition-opacity ${
                  isSelected ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'
                }`}
                style={{ backgroundColor: config.accentColor }}
              />

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{config.flag}</span>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                      {config.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {config.country}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-cosmos-950">
                    ACTIVO
                  </span>
                )}
              </div>

              {/* Jackpot */}
              <div className="my-3 p-3 rounded-xl bg-cosmos-950/60 border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-mono mb-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>PREMIO ESTIMADO</span>
                </div>
                <div className="text-xl sm:text-2xl font-display font-black text-amber-300 tracking-tight">
                  {config.officialJackpotEstimate}
                </div>
              </div>

              {/* Draw Schedule & Rules info */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{config.drawDays.join(' y ')}</span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
                  {config.id === 'euromillones' && '5 Números (1-50) + 2 Estrellas (1-12)'}
                  {config.id === 'primitiva' && '6 Números (1-49) + 1 Reintegro (0-9)'}
                  {config.id === 'medellin' && '4 Cifras (0000-9999) + Serie (000-999)'}
                  {config.id === 'nacional' && '5 Cifras (00000-99999) + Serie (1-10)'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
