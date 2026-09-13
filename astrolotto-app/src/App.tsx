import React, { useState, useEffect, useCallback } from 'react';
import { ParticleCanvas } from './components/ParticleCanvas';
import { LiveHeader } from './components/LiveHeader';
import { LotterySelector } from './components/LotterySelector';
import { TicketDisplay } from './components/TicketDisplay';
import { BotConsole } from './components/BotConsole';
import { UserProfileModal } from './components/UserProfileModal';
import { HistoricalStatsModal } from './components/HistoricalStatsModal';
import { AstroChartModal } from './components/AstroChartModal';
import { MobileQrModal } from './components/MobileQrModal';
import { LatestResultsWidget } from './components/LatestResultsWidget';
import { TicketCheckerSection } from './components/TicketCheckerSection';
import { LOTTERY_CONFIGS } from './data/historicalLotteryData';
import type {
  LotteryStats,
  LotteryType,
  OracleLog,
  PredictedTicket,
  UserAstralProfile,
} from './types/lottery';
import { calculateLotteryStats, runPredictionEngine } from './services/predictionEngine';
import { computeAstroInfluence } from './services/astrologyEngine';
import { computeNumerologyBreakdown } from './services/numerologyEngine';
import { triggerHaptic, triggerSuccessHaptic } from './services/nativeBridge';
import { SlidersHorizontal, Layers, Cpu, Zap } from 'lucide-react';

export const App: React.FC = () => {
  // Active lottery
  const [selectedLottery, setSelectedLottery] = useState<LotteryType>('euromillones');
  const activeConfig = LOTTERY_CONFIGS[selectedLottery];

  // User astral profile & defaults
  const [userProfile, setUserProfile] = useState<UserAstralProfile>({
    name: 'Juan López',
    birthDate: '1992-05-18',
    zodiacSign: 'Tauro',
    lifePathNumber: 8,
    favoriteNumbers: [7, 14, 21, 33, 42],
    luckyCharm: 'Trébol de Oro Cuántico',
    drawDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    weights: {
      history: 85,
      astrology: 75,
      numerology: 80,
      favorites: 65,
    },
  });

  // Ticket count to generate (1, 3, or 5)
  const [ticketCount, setTicketCount] = useState<number>(3);

  // Predictions state
  const [tickets, setTickets] = useState<PredictedTicket[]>([]);
  const [stats, setStats] = useState<LotteryStats>(() => calculateLotteryStats('euromillones'));
  const [logs, setLogs] = useState<OracleLog[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isAstroOpen, setIsAstroOpen] = useState<boolean>(false);
  const [isMobileQrOpen, setIsMobileQrOpen] = useState<boolean>(false);

  // Auto-recalculate stats when lottery changes
  useEffect(() => {
    setStats(calculateLotteryStats(selectedLottery));
  }, [selectedLottery]);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    triggerHaptic();
    setIsGenerating(true);
    setLogs([]); // fresh logs

    try {
      const result = await runPredictionEngine(
        selectedLottery,
        userProfile,
        ticketCount,
        (newLog) => {
          setLogs((prev) => [...prev, newLog]);
        }
      );
      setTickets(result.tickets);
      setStats(result.stats);
      triggerSuccessHaptic();
    } catch (err) {
      console.error('Error generating predictions:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedLottery, userProfile, ticketCount]);

  // Initial trigger
  useEffect(() => {
    handleGenerate();
  }, [selectedLottery]);

  // Astro and Numerology computed on the fly for modals
  const currentAstro = computeAstroInfluence(userProfile.drawDate, userProfile.birthDate);
  const currentNumerology = computeNumerologyBreakdown(userProfile.birthDate, userProfile.drawDate);

  return (
    <div className="relative min-h-screen bg-cosmos-950 text-slate-100 flex flex-col selection:bg-astral-violet selection:text-white">
      {/* Background Star Canvas */}
      <ParticleCanvas />

      {/* Top Header with live status & telemetry */}
      <LiveHeader
        userName={userProfile.name}
        userLifePath={userProfile.lifePathNumber}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenAstro={() => setIsAstroOpen(true)}
        onOpenMobileQr={() => setIsMobileQrOpen(true)}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Lottery Selector Grid */}
        <LotterySelector
          selected={selectedLottery}
          onSelect={(type) => {
            setSelectedLottery(type);
          }}
        />

        {/* Live Official Results Widget */}
        <LatestResultsWidget
          currentLottery={selectedLottery}
          tickets={tickets}
          onSelectLottery={(type) => setSelectedLottery(type)}
        />

        {/* Interactive Ticket & Prize Checker */}
        <TicketCheckerSection
          currentLottery={selectedLottery}
        />

        {/* Quick Calibration Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-cosmos-900/70 border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-lg backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cosmos-950/80 border border-white/10 text-xs font-mono text-slate-300">
              <span className="text-amber-400 font-bold">Consultor:</span>
              <span>{userProfile.name}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cosmos-950/80 border border-white/10 text-xs font-mono text-slate-300">
              <span className="text-purple-400 font-bold">Fecha Sorteo:</span>
              <span>{userProfile.drawDate}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cosmos-950/80 border border-white/10 text-xs font-mono text-slate-300">
              <span className="text-rose-400 font-bold">Favoritos ({userProfile.favoriteNumbers.length}):</span>
              <span>{userProfile.favoriteNumbers.join(', ') || 'Ninguno'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Ticket count selector */}
            <div className="flex items-center gap-1.5 bg-cosmos-950/80 p-1 rounded-xl border border-white/10">
              <Layers className="w-3.5 h-3.5 text-slate-400 ml-2" />
              <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline">Boletos:</span>
              {[1, 3, 5].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setTicketCount(cnt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                    ticketCount === cnt
                      ? 'bg-amber-400 text-cosmos-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Ajustar Pesos</span>
            </button>
          </div>
        </div>

        {/* Neural Oracle Terminal Stream */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-purple-300">
              <Cpu className="w-3.5 h-3.5" />
              FLUJO DE PENSAMIENTO Y CÁLCULOS DEL BOT
            </span>
            <span>Motor de Síntesis Monte Carlo Activo</span>
          </div>
          <BotConsole logs={logs} isThinking={isGenerating} />
        </div>

        {/* Results & Generated Tickets Display */}
        <TicketDisplay
          tickets={tickets}
          config={activeConfig}
          onRegenerate={handleGenerate}
          isGenerating={isGenerating}
        />

        {/* Quantum & Probability Methodology Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cosmos-900/60 to-cosmos-950/90 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-lg text-white">
                Metodología del Oráculo Cuántico de AstroLotto
              </h4>
              <p className="text-xs text-slate-400">
                Fusión matemática de 4 dimensiones para maximizar la afinidad vibracional y estadística.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-cosmos-950/60 border border-white/5">
              <div className="font-mono text-xs font-bold text-cyan-400 mb-1">
                1. Histórico & Frecuencia
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Minimiza colisiones y analiza la campana de Gauss, atrasos kármicos (gaps) y la suma canónica promedio.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cosmos-950/60 border border-white/5">
              <div className="font-mono text-xs font-bold text-purple-400 mb-1">
                2. Tránsitos Astrales
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Efemérides de la fase lunar y horas planetarias del día exacto del sorteo en resonancia con el signo zodiacal.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cosmos-950/60 border border-white/5">
              <div className="font-mono text-xs font-bold text-amber-400 mb-1">
                3. Numerología Pitagórica
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cálculo del Sendero de Vida (Life Path) personal, día universal y octavas de números maestros (11, 22, 33).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cosmos-950/60 border border-white/5">
              <div className="font-mono text-xs font-bold text-rose-400 mb-1">
                4. Entropía Personal
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tus números favoritos integrados sin quebrar las restricciones de suma, paridad o dispersión matemática.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-cosmos-950/95 py-8 text-center font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Main attribution line */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-white font-bold tracking-wide">AstroLotto AI</span>
              <span className="text-slate-500">v2.5 · Oráculo Cuántico de Loterías</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">🇪🇺 Euromillones</span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">🇪🇸 La Primitiva</span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">🇪🇸 Lotería Nacional</span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">🇨🇴 Lotería de Medellín</span>
            </div>
          </div>

          {/* Designer attribution & Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span>Diseñada por</span>
              <span className="font-display font-bold text-amber-300 tracking-wide text-sm bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                Juan Guillermo López Herrera
              </span>
            </div>
            <div className="text-slate-500 text-[11px]">
              © {new Date().getFullYear()} AstroLotto AI. Todos los derechos reservados.
            </div>
          </div>

        </div>
      </footer>

      {/* Modals */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onSave={(newProfile) => {
          setUserProfile(newProfile);
          setTimeout(() => handleGenerate(), 200);
        }}
      />

      <HistoricalStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        type={selectedLottery}
        stats={stats}
      />

      <AstroChartModal
        isOpen={isAstroOpen}
        onClose={() => setIsAstroOpen(false)}
        astro={currentAstro}
        numerology={currentNumerology}
        profile={userProfile}
      />

      <MobileQrModal
        isOpen={isMobileQrOpen}
        onClose={() => setIsMobileQrOpen(false)}
        localIp="192.168.1.135"
        port={5173}
        publicUrl="https://juanglopezh-design.github.io/opengravity/"
      />
    </div>
  );
};

export default App;
