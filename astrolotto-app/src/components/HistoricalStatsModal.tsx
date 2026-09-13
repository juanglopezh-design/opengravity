import React from 'react';
import { HISTORICAL_DRAWS, LOTTERY_CONFIGS } from '../data/historicalLotteryData';
import type { LotteryStats, LotteryType } from '../types/lottery';
import { X, Flame, Snowflake, Clock, History, CheckCircle2 } from 'lucide-react';

interface HistoricalStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: LotteryType;
  stats: LotteryStats;
}

export const HistoricalStatsModal: React.FC<HistoricalStatsModalProps> = ({
  isOpen,
  onClose,
  type,
  stats,
}) => {
  if (!isOpen) return null;

  const config = LOTTERY_CONFIGS[type];
  const draws = HISTORICAL_DRAWS[type] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-cosmos-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px]">
            <div className="w-full h-full bg-cosmos-950 rounded-[15px] flex items-center justify-center">
              <History className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center gap-2">
              Estadísticas Históricas: {config.name}
              <span className="text-xl">{config.flag}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Datos extraídos de sorteos oficiales auditados para el cálculo de probabilidades.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Key Metrics Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-cosmos-950/60 border border-white/5 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Sorteos Auditados</span>
              <span className="text-xl font-display font-bold text-cyan-300">{draws.length} sorteos</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-cosmos-950/60 border border-white/5 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Suma Media</span>
              <span className="text-xl font-display font-bold text-amber-300">{stats.averageSum}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-cosmos-950/60 border border-white/5 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Proporción Pares</span>
              <span className="text-xl font-display font-bold text-purple-300">{stats.parityRatio.even}%</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-cosmos-950/60 border border-white/5 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Proporción Impares</span>
              <span className="text-xl font-display font-bold text-rose-300">{stats.parityRatio.odd}%</span>
            </div>
          </div>

          {/* Hot vs Cold vs Due */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Hot Numbers */}
            <div className="p-4 rounded-2xl bg-cosmos-950/70 border border-amber-400/20">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold mb-3">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                NÚMEROS CALIENTES (Top Frecuencia)
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.hotNumbers.map((item) => (
                  <div
                    key={item.number}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs"
                  >
                    <span className="font-bold">{item.number}</span>
                    <span className="text-[10px] text-amber-400/70">({item.frequency}x)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cold Numbers */}
            <div className="p-4 rounded-2xl bg-cosmos-950/70 border border-cyan-400/20">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-3">
                <Snowflake className="w-4 h-4 text-cyan-400" />
                NÚMEROS FRÍOS (Menor Salida)
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.coldNumbers.map((item) => (
                  <div
                    key={item.number}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 font-mono text-xs"
                  >
                    <span className="font-bold">{item.number}</span>
                    <span className="text-[10px] text-cyan-400/70">({item.frequency}x)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Due Numbers */}
            <div className="p-4 rounded-2xl bg-cosmos-950/70 border border-purple-400/20">
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold mb-3">
                <Clock className="w-4 h-4 text-purple-400" />
                NÚMEROS REZAGADOS (Mayor Atraso)
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.dueNumbers.map((item) => (
                  <div
                    key={item.number}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-400/10 border border-purple-400/30 text-purple-300 font-mono text-xs"
                  >
                    <span className="font-bold">{item.number}</span>
                    <span className="text-[10px] text-purple-400/70">hace {item.gap}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Recent Official Draws Table */}
          <div>
            <h3 className="text-sm font-display font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Últimos Resultados Oficiales Registrados
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-cosmos-950/60">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-400">
                    <th className="py-2.5 px-4">Fecha</th>
                    <th className="py-2.5 px-4">Números Ganadores</th>
                    <th className="py-2.5 px-4">{config.extraLabel}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {draws.slice(0, 6).map((draw) => (
                    <tr key={draw.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-slate-400">{draw.date}</td>
                      <td className="py-3 px-4 font-bold text-white">
                        {config.formatMainAsDigits ? (
                          <span
                            className={`px-2.5 py-1 rounded text-sm font-bold border ${
                              config.id === 'nacional'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            }`}
                          >
                            {draw.numbers.join('')}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {draw.numbers.map((n) => (
                              <span
                                key={n}
                                className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-xs"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {draw.extra.map((e, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold"
                            >
                              {config.id === 'medellin' ? e.toString().padStart(3, '0') : e}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
