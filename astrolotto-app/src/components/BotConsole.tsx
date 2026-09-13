import React, { useEffect, useRef } from 'react';
import type { OracleLog } from '../types/lottery';
import { Terminal, Cpu, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface BotConsoleProps {
  logs: OracleLog[];
  isThinking: boolean;
}

export const BotConsole: React.FC<BotConsoleProps> = ({ logs, isThinking }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full bg-cosmos-950/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-cosmos-900/90 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400" />
          </div>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono font-semibold text-slate-300">
              ORACLE_NEURAL_STREAM :: v2.4
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isThinking ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
              <Cpu className="w-3 h-3 animate-spin text-purple-400" />
              PROCESANDO SÍNTESIS CUÁNTICA...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SISTEMA EN ESPERA Y SINCRONIZADO
            </span>
          )}
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        className="p-4 font-mono text-xs max-h-56 min-h-36 overflow-y-auto space-y-2.5 bg-cosmos-950/80"
      >
        {logs.length === 0 ? (
          <div className="text-slate-500 py-6 text-center italic">
            &gt; Inicializando terminal de predicción. Presiona "Generar Boletos Ganadores" para iniciar el análisis cuántico...
          </div>
        ) : (
          logs.map((log) => {
            let badgeColor = 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10';
            let icon = <Clock className="w-3 h-3 text-cyan-400" />;

            if (log.status === 'success') {
              badgeColor = 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
              icon = <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
            } else if (log.status === 'highlight') {
              badgeColor = 'text-amber-400 border-amber-400/30 bg-amber-400/10';
              icon = <Sparkles className="w-3 h-3 text-amber-400" />;
            }

            return (
              <div key={log.id} className="flex items-start gap-2.5 leading-relaxed text-slate-300">
                <span className="text-slate-500 text-[10px] select-none pt-0.5">
                  [{log.timestamp}]
                </span>

                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border shrink-0 flex items-center gap-1 ${badgeColor}`}
                >
                  {icon}
                  {log.stage}
                </span>

                <div className="flex-1">
                  <span className="text-slate-200">{log.message}</span>
                  {log.detail && (
                    <span className="block text-[11px] text-slate-400 mt-0.5 pl-2 border-l border-white/10">
                      ↳ {log.detail}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isThinking && (
          <div className="flex items-center gap-2 text-purple-400 pt-1">
            <span className="animate-pulse">&gt; Calculando matrices de tránsitos y atrasos kármicos...</span>
            <span className="w-2 h-4 bg-purple-400 animate-pulse" />
          </div>
        )}
      </div>

    </div>
  );
};
