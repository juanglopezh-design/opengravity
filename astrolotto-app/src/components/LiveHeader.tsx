import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Sparkles, Activity, Moon, BarChart2, Globe2, Smartphone } from 'lucide-react';
import { networkMonitor, type NetworkStatus } from '../services/networkMonitor';

interface LiveHeaderProps {
  onOpenStats: () => void;
  onOpenAstro: () => void;
  onOpenProfile: () => void;
  onOpenMobileQr: () => void;
  userLifePath: number;
  userName: string;
}

export const LiveHeader: React.FC<LiveHeaderProps> = ({
  onOpenStats,
  onOpenAstro,
  onOpenProfile,
  onOpenMobileQr,
  userLifePath,
  userName,
}) => {
  const [network, setNetwork] = useState<NetworkStatus>(networkMonitor.getStatus());
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe((status) => {
      setNetwork(status);
    });

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-cosmos-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-astral-violet via-purple-600 to-amber-400 p-[1.5px] shadow-astral-glow">
            <div className="w-full h-full bg-cosmos-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl sm:text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-purple-300">
                ASTROLOTTO
              </span>
              <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 uppercase font-semibold">
                AI BOT 2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Oráculo Predictivo Cuántico · Euromillones · Primitiva · Medellín
            </p>
          </div>
        </div>

        {/* Real-time Internet & Quantum Network Telemetry */}
        <div className="hidden md:flex items-center gap-3 bg-cosmos-900/90 border border-white/10 rounded-full px-4 py-1.5 shadow-inner">
          <div className="flex items-center gap-2">
            {network.isOnline ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            ) : (
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
            <span className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1">
              {network.isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  ONLINE
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                  OFFLINE
                </>
              )}
            </span>
          </div>

          <div className="h-3.5 w-px bg-white/15" />

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>{network.latencyMs}ms</span>
          </div>

          <div className="h-3.5 w-px bg-white/15" />

          <div className="flex items-center gap-1 text-[11px] text-amber-300/90 font-mono">
            <Globe2 className="w-3 h-3 text-amber-400" />
            <span>{currentTime || '21:00:00'}</span>
          </div>
        </div>

        {/* Actions & User Hub */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenMobileQr}
            title="Ver en mi Celular (Código QR)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 transition-all hover:border-cyan-400"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline font-bold">Celular QR</span>
          </button>

          <button
            onClick={onOpenStats}
            title="Ver estadísticas y números calientes/fríos"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-amber-400/40"
          >
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline">Histórico</span>
          </button>

          <button
            onClick={onOpenAstro}
            title="Efemérides Astrales y Fases Lunares"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-purple-400/40"
          >
            <Moon className="w-4 h-4 text-purple-400" />
            <span className="hidden lg:inline">Astros</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-xl bg-gradient-to-r from-astral-violet/30 to-amber-500/20 hover:from-astral-violet/40 hover:to-amber-500/30 border border-amber-400/30 transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-mono font-bold text-xs">
              {userLifePath}
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                {userName || 'Consultor'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Life Path #{userLifePath}
              </div>
            </div>
          </button>
        </div>

      </div>
    </header>
  );
};
