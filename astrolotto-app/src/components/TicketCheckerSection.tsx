import React, { useState } from 'react';
import { LOTTERY_CONFIGS, HISTORICAL_DRAWS } from '../data/historicalLotteryData';
import type { LotteryConfig, LotteryType } from '../types/lottery';
import { checkTicketPrize, type PrizeCheckResult, MEDELLIN_SECOS_4741 } from '../services/prizeChecker';
import { Search, Trophy, CheckCircle, AlertCircle, Sparkles, ChevronDown, ChevronUp, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TicketCheckerSectionProps {
  currentLottery: LotteryType;
}

export const TicketCheckerSection: React.FC<TicketCheckerSectionProps> = ({
  currentLottery,
}) => {
  const config: LotteryConfig = LOTTERY_CONFIGS[currentLottery];
  const allDraws = HISTORICAL_DRAWS[currentLottery] || [];
  const [selectedDrawIndex, setSelectedDrawIndex] = useState<number>(0);

  // Reset selected draw when lottery changes
  React.useEffect(() => {
    setSelectedDrawIndex(0);
  }, [currentLottery]);

  const targetDraw = allDraws[selectedDrawIndex] || allDraws[0];

  // Inputs state
  // Euromillones: 5 numbers, 2 stars
  const [emMain, setEmMain] = useState<string[]>(['', '', '', '', '']);
  const [emStars, setEmStars] = useState<string[]>(['', '']);

  // Primitiva: 6 numbers, 1 reintegro
  const [prMain, setPrMain] = useState<string[]>(['', '', '', '', '', '']);
  const [prReintegro, setPrReintegro] = useState<string>('');

  // Medellin: 4 digits, 1 serie
  const [medDigits, setMedDigits] = useState<string[]>(['', '', '', '']);
  const [medSerie, setMedSerie] = useState<string>('');

  // Nacional: 5 digits, 1 serie
  const [nacDigits, setNacDigits] = useState<string[]>(['', '', '', '', '']);
  const [nacSerie, setNacSerie] = useState<string>('1');

  // Result state
  const [result, setResult] = useState<PrizeCheckResult | null>(null);
  const [showSecosTable, setShowSecosTable] = useState(false);
  const [showNacPremiosTable, setShowNacPremiosTable] = useState(false);

  // Clear or auto-fill with selected winning draw
  const handleAutoFillSampleWinner = () => {
    if (currentLottery === 'euromillones') {
      setEmMain(targetDraw.numbers.map(String));
      setEmStars(targetDraw.extra.map(String));
    } else if (currentLottery === 'primitiva') {
      setPrMain(targetDraw.numbers.map(String));
      setPrReintegro(String(targetDraw.extra[0]));
    } else if (currentLottery === 'medellin') {
      setMedDigits(targetDraw.numbers.map(String));
      setMedSerie(String(targetDraw.extra[0]).padStart(3, '0'));
    } else {
      setNacDigits(targetDraw.numbers.map(String));
      setNacSerie(String(targetDraw.extra[0] || '1'));
    }
  };

  const handleCheckPrize = (e: React.FormEvent) => {
    e.preventDefault();

    let mainNums: number[] = [];
    let extraNums: number[] = [];

    if (currentLottery === 'euromillones') {
      mainNums = emMain.map((v) => parseInt(v, 10)).filter((n) => !isNaN(n));
      extraNums = emStars.map((v) => parseInt(v, 10)).filter((n) => !isNaN(n));
      if (mainNums.length !== 5 || extraNums.length !== 2) {
        alert('Por favor ingresa los 5 números (1-50) y las 2 estrellas (1-12) de Euromillones.');
        return;
      }
    } else if (currentLottery === 'primitiva') {
      mainNums = prMain.map((v) => parseInt(v, 10)).filter((n) => !isNaN(n));
      const r = parseInt(prReintegro, 10);
      if (mainNums.length !== 6 || isNaN(r)) {
        alert('Por favor ingresa los 6 números (1-49) y el Reintegro (0-9) de La Primitiva.');
        return;
      }
      extraNums = [r];
    } else if (currentLottery === 'medellin') {
      mainNums = medDigits.map((v) => parseInt(v, 10)).filter((n) => !isNaN(n));
      const s = parseInt(medSerie, 10);
      if (mainNums.length !== 4 || isNaN(s)) {
        alert('Por favor ingresa las 4 cifras del billete (0-9) y el número de Serie (0-999).');
        return;
      }
      extraNums = [s];
    } else {
      // Nacional
      mainNums = nacDigits.map((v) => parseInt(v, 10)).filter((n) => !isNaN(n));
      const s = parseInt(nacSerie, 10);
      if (mainNums.length !== 5) {
        alert('Por favor ingresa las 5 cifras del décimo de Lotería Nacional (0 al 9).');
        return;
      }
      extraNums = [isNaN(s) ? 1 : s];
    }

    const check = checkTicketPrize(currentLottery, mainNums, extraNums, targetDraw);
    setResult(check);

    if (check.hasWon) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#facc15', '#a855f7', '#06b6d4'],
      });
    }
  };

  return (
    <div className="w-full relative rounded-3xl bg-gradient-to-br from-cosmos-900/90 via-cosmos-900/70 to-cosmos-950/95 border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
      
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-cosmos-950 shadow-lg">
            <Search className="w-5 h-5 font-bold" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
              Comprobador Oficial de Boletos & Premios
              <span className="text-xl">{config.flag}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ingresa tu boleto para comprobar al instante si has ganado algún premio o subpremio en {config.name}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoFillSampleWinner}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 border border-white/10 text-xs font-mono transition-colors"
          title="Autocompletar con el sorteo oficial seleccionado para probar el escáner"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Probar con Ganador Oficial</span>
        </button>
      </div>

      {/* Sorteo Selection & Official Winning Results Reference Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-cosmos-950/80 border border-amber-400/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-amber-300 uppercase">
              Sorteo Oficial a Comprobar:
            </span>
            <select
              value={selectedDrawIndex}
              onChange={(e) => setSelectedDrawIndex(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-cosmos-900 border border-amber-400/40 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400 focus:shadow-gold-glow cursor-pointer"
            >
              {allDraws.slice(0, 6).map((draw, idx) => (
                <option key={draw.id} value={idx} className="bg-cosmos-950 text-white">
                  {idx === 0 ? '⭐ [ÚLTIMO SORTEO CELEBRADO] ' : ''}{draw.date} — {draw.drawNumber || `Sorteo #${idx + 1}`} ({config.formatMainAsDigits ? draw.numbers.join('') : draw.numbers.join(', ')})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleAutoFillSampleWinner}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30 transition-colors self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cargar este número oficial en las casillas</span>
          </button>
        </div>

        {/* Live Numbers Reference Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-slate-400 uppercase font-semibold">
              {config.id === 'nacional' ? '1er Premio Ganador:' : config.id === 'medellin' ? 'Premio Mayor Ganador:' : 'Combinación Ganadora:'}
            </span>
            <span className="text-base sm:text-lg font-black text-white px-3 py-1 rounded-xl bg-white/10 border border-white/20 tracking-wider">
              {config.formatMainAsDigits ? targetDraw.numbers.join('') : targetDraw.numbers.join(' - ')}
            </span>

            {targetDraw.segundoPremio && (
              <div className="flex items-center gap-1.5 ml-1">
                <span className="text-slate-400 uppercase">2º Premio:</span>
                <span className="text-amber-300 font-black px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-sm">
                  {targetDraw.segundoPremio.join('')}
                </span>
              </div>
            )}

            {targetDraw.reintegros && (
              <div className="flex items-center gap-1.5 ml-1">
                <span className="text-slate-400 uppercase">Reintegros:</span>
                <div className="flex items-center gap-1">
                  {targetDraw.reintegros.map((r) => (
                    <span
                      key={r}
                      className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold flex items-center justify-center text-xs"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {targetDraw.extra && targetDraw.extra.length > 0 && !targetDraw.reintegros && (
              <span className="text-slate-400">
                · {config.extraLabel}: <strong className="text-amber-300 font-black">{config.formatSerie ? targetDraw.extra[0].toString().padStart(3, '0') : targetDraw.extra.join(', ')}</strong>
              </span>
            )}
          </div>

          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{targetDraw.source || 'Lotería Oficial SELAE'}</span>
          </span>
        </div>
      </div>

      {/* Interactive Input Form */}
      <form onSubmit={handleCheckPrize} className="space-y-6">
        
        {/* Lottery Specific Inputs */}
        {currentLottery === 'euromillones' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-2.5 font-semibold">
                Tus 5 Números Principales (1 al 50):
              </label>
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                {emMain.map((val, idx) => (
                  <input
                    key={idx}
                    id={`em-main-${idx}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    placeholder="00"
                    value={val}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 2);
                      const next = [...emMain];
                      next[idx] = clean;
                      setEmMain(next);
                      if (clean.length === 2 && idx < 4) {
                        document.getElementById(`em-main-${idx + 1}`)?.focus();
                      } else if (clean.length === 2 && idx === 4) {
                        document.getElementById('em-star-0')?.focus();
                      }
                    }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cosmos-950/90 border border-purple-400/40 text-center font-mono font-black text-xl sm:text-2xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-400 focus:shadow-astral-glow shrink-0 transition-all"
                    required
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-amber-300 mb-2.5 font-semibold">
                Tus 2 Estrellas (1 al 12):
              </label>
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                {emStars.map((val, idx) => (
                  <input
                    key={idx}
                    id={`em-star-${idx}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    placeholder="★"
                    value={val}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 2);
                      const next = [...emStars];
                      next[idx] = clean;
                      setEmStars(next);
                      if (clean.length === 2 && idx === 0) {
                        document.getElementById('em-star-1')?.focus();
                      }
                    }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cosmos-950/90 border border-amber-400/40 text-center font-mono font-black text-xl sm:text-2xl text-amber-300 placeholder-amber-400/40 focus:outline-none focus:border-amber-400 focus:shadow-gold-glow shrink-0 transition-all"
                    required
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {currentLottery === 'primitiva' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-2.5 font-semibold">
                Tus 6 Números de La Primitiva (1 al 49):
              </label>
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                {prMain.map((val, idx) => (
                  <input
                    key={idx}
                    id={`pr-main-${idx}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    placeholder="00"
                    value={val}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 2);
                      const next = [...prMain];
                      next[idx] = clean;
                      setPrMain(next);
                      if (clean.length === 2 && idx < 5) {
                        document.getElementById(`pr-main-${idx + 1}`)?.focus();
                      } else if (clean.length === 2 && idx === 5) {
                        document.getElementById('pr-r')?.focus();
                      }
                    }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cosmos-950/90 border border-emerald-400/40 text-center font-mono font-black text-xl sm:text-2xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:shadow-emerald-glow shrink-0 transition-all"
                    required
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-amber-300 mb-2.5 font-semibold">
                Número de Reintegro (0 al 9):
              </label>
              <input
                id="pr-r"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                placeholder="R"
                value={prReintegro}
                onChange={(e) => setPrReintegro(e.target.value.replace(/\D/g, '').slice(0, 1))}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cosmos-950/90 border border-amber-400/40 text-center font-mono font-black text-xl sm:text-2xl text-amber-300 placeholder-amber-400/40 focus:outline-none focus:border-amber-400 focus:shadow-gold-glow shrink-0 transition-all"
                required
              />
            </div>
          </div>
        )}

        {currentLottery === 'medellin' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              
              {/* 4 Digits */}
              <div>
                <label className="block text-xs font-mono text-cyan-300 mb-2 font-semibold">
                  Tus 4 Cifras del Billete (0 al 9):
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  {medDigits.map((val, idx) => (
                    <input
                      key={idx}
                      id={`med-digit-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      placeholder="0"
                      value={val}
                      onChange={(e) => {
                        const valClean = e.target.value.replace(/\D/g, '');
                        const next = [...medDigits];
                        next[idx] = valClean;
                        setMedDigits(next);
                        if (valClean && idx < 3) {
                          document.getElementById(`med-digit-${idx + 1}`)?.focus();
                        } else if (valClean && idx === 3) {
                          document.getElementById('med-serie')?.focus();
                        }
                      }}
                      className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl bg-cosmos-950/90 border border-cyan-400/40 text-center font-mono font-black text-2xl sm:text-3xl text-white focus:outline-none focus:border-cyan-400 focus:shadow-cyan-glow shrink-0 transition-all"
                      required
                    />
                  ))}
                </div>
              </div>

              {/* Serie */}
              <div>
                <label className="block text-xs font-mono text-amber-300 mb-2 font-semibold">
                  Número de Serie (000 al 999):
                </label>
                <input
                  id="med-serie"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={3}
                  placeholder="000"
                  value={medSerie}
                  onChange={(e) => setMedSerie(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className="w-28 h-16 sm:h-20 px-2 rounded-2xl bg-cosmos-950/90 border border-amber-400/40 text-center font-mono font-black text-2xl sm:text-3xl text-amber-300 focus:outline-none focus:border-amber-400 focus:shadow-gold-glow shrink-0 transition-all"
                  required
                />
              </div>

            </div>

            {/* Subpremios Drawer Trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSecosTable(!showSecosTable)}
                className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-amber-300 hover:text-amber-200 bg-amber-400/10 hover:bg-amber-400/20 px-3.5 py-2 rounded-xl border border-amber-400/30 transition-colors"
              >
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Ver Plan Completo de Subpremios y Secos de Medellín ($15.000M)</span>
                {showSecosTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Subpremios / Secos List Table */}
              {showSecosTable && (
                <div className="mt-4 p-5 rounded-2xl bg-cosmos-950/90 border border-white/10 space-y-3 animate-fade-in text-xs font-mono">
                  <div className="flex items-center justify-between text-amber-300 font-bold border-b border-white/10 pb-2">
                    <span>SECOS OFICIALES SORTEO 4741 (MEDELLÍN)</span>
                    <span>VALOR</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {MEDELLIN_SECOS_4741.map((seco, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-cosmos-900/60 border border-white/5 hover:border-amber-400/30 transition-colors"
                      >
                        <div>
                          <span className="text-white font-bold block">{seco.name}</span>
                          <span className="text-[11px] text-slate-400">
                            Número: <span className="text-cyan-300 font-bold">{seco.number}</span> · Serie: <span className="text-amber-300 font-bold">{seco.serie}</span>
                          </span>
                        </div>
                        <span className="text-emerald-400 font-bold text-right shrink-0">
                          {seco.prize}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Approximations info */}
                  <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 space-y-1">
                    <span className="font-bold text-amber-300 block uppercase">Aproximaciones al Mayor con y sin Serie:</span>
                    <p>• Últimas 3 cifras con serie: $10.000.000 COP | Primeras 3 cifras con serie: $10.000.000 COP</p>
                    <p>• Dos últimas cifras con serie: $2.000.000 COP | Dos primeras cifras con serie: $2.000.000 COP</p>
                    <p>• Mayor en diferente serie (4 cifras): $5.000.000 COP | Tres últimas cifras sin serie: $40.000 COP</p>
                    <p>• Dos últimas cifras sin serie: $15.000 COP | Última cifra (la uña): $10.000 COP</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentLottery === 'nacional' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              
              {/* 5 Digits */}
              <div>
                <label className="block text-xs font-mono text-rose-300 mb-2 font-semibold">
                  Tus 5 Cifras del Décimo (00000 al 99999):
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  {nacDigits.map((val, idx) => (
                    <input
                      key={idx}
                      id={`nac-digit-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      placeholder="0"
                      value={val}
                      onChange={(e) => {
                        const valClean = e.target.value.replace(/\D/g, '');
                        const next = [...nacDigits];
                        next[idx] = valClean;
                        setNacDigits(next);
                        if (valClean && idx < 4) {
                          document.getElementById(`nac-digit-${idx + 1}`)?.focus();
                        } else if (valClean && idx === 4) {
                          document.getElementById('nac-serie')?.focus();
                        }
                      }}
                      className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl bg-cosmos-950/90 border border-rose-500/40 text-center font-mono font-black text-2xl sm:text-3xl text-white focus:outline-none focus:border-rose-400 focus:shadow-gold-glow shrink-0 transition-all"
                      required
                    />
                  ))}
                </div>
              </div>

              {/* Serie (optional / 1-10) */}
              <div>
                <label className="block text-xs font-mono text-amber-300 mb-2 font-semibold">
                  Serie (1 al 10):
                </label>
                <input
                  id="nac-serie"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  placeholder="1"
                  value={nacSerie}
                  onChange={(e) => setNacSerie(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  className="w-20 h-16 sm:h-20 px-2 rounded-2xl bg-cosmos-950/90 border border-amber-400/40 text-center font-mono font-black text-2xl sm:text-3xl text-amber-300 focus:outline-none focus:border-amber-400 focus:shadow-gold-glow shrink-0 transition-all"
                />
              </div>

            </div>

            {/* Nacional Prizes Drawer Trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowNacPremiosTable(!showNacPremiosTable)}
                className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2 rounded-xl border border-rose-500/30 transition-colors"
              >
                <Gift className="w-4 h-4 text-rose-400" />
                <span>Ver Plan Completo de Premios y Extracciones Oficiales (Lotería Nacional)</span>
                {showNacPremiosTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Nacional Prizes Details */}
              {showNacPremiosTable && (
                <div className="mt-4 p-5 rounded-2xl bg-cosmos-950/90 border border-white/10 space-y-4 animate-fade-in text-xs font-mono">
                  <div className="flex items-center justify-between text-amber-300 font-bold border-b border-white/10 pb-2">
                    <span>CUADRO DE PREMIOS OFICIALES (SORTEO DEL SÁBADO SELAE)</span>
                    <span>PREMIO AL DÉCIMO</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-cosmos-900/60 border border-rose-500/30 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">1er Premio (37.872)</span>
                        <span className="text-[11px] text-slate-400">600.120 € a la serie</span>
                      </div>
                      <span className="text-amber-300 font-bold text-base">60.012 €</span>
                    </div>

                    <div className="p-3 rounded-xl bg-cosmos-900/60 border border-amber-500/30 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">2º Premio (31.827)</span>
                        <span className="text-[11px] text-slate-400">120.000 € a la serie</span>
                      </div>
                      <span className="text-amber-300 font-bold text-base">12.000 €</span>
                    </div>

                    <div className="p-3 rounded-xl bg-cosmos-900/60 border border-white/10 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">Aproximación 1er Premio</span>
                        <span className="text-[11px] text-slate-400">Números 37.871 y 37.873</span>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">1.200 €</span>
                    </div>

                    <div className="p-3 rounded-xl bg-cosmos-900/60 border border-white/10 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">Aproximación 2º Premio</span>
                        <span className="text-[11px] text-slate-400">Números 31.826 y 31.828</span>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">754 €</span>
                    </div>

                    <div className="p-3 rounded-xl bg-cosmos-900/60 border border-white/10 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">4 Últimas Cifras (4 extracciones)</span>
                        <span className="text-[11px] text-cyan-300">2578, 3859, 6377, 7650</span>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">150 €</span>
                    </div>

                    <div className="p-3 rounded-xl bg-cosmos-900/60 border border-white/10 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">3 Últimas Cifras (o Centenas)</span>
                        <span className="text-[11px] text-slate-400">10 extracciones + terminación 872</span>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">30 €</span>
                    </div>

                    <div className="p-3 rounded-xl bg-cosmos-900/60 border border-white/10 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">2 Últimas Cifras (9 extracciones)</span>
                        <span className="text-[11px] text-slate-400">09, 19, 32, 39, 54, 72, 74, 98, 99</span>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">12 €</span>
                    </div>

                    <div className="p-3 rounded-xl bg-cosmos-900/60 border border-white/10 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">Reintegros Oficiales</span>
                        <span className="text-[11px] text-purple-300 font-bold">Terminados en 0, 1 o 2</span>
                      </div>
                      <span className="text-purple-300 font-bold text-sm">6,00 € (Devolución)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Check Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:from-emerald-400 hover:to-teal-300 text-cosmos-950 font-display font-black text-base shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Trophy className="w-5 h-5 text-cosmos-950" />
            <span>Verificar si mi Boleto Ganó</span>
          </button>
        </div>

      </form>

      {/* Prize Result Banner */}
      {result && (
        <div
          className={`mt-6 p-6 rounded-3xl border transition-all animate-fade-in ${
            result.hasWon
              ? 'bg-gradient-to-r from-emerald-950/80 via-cosmos-900/90 to-teal-950/80 border-emerald-400/50 shadow-xl'
              : 'bg-cosmos-950/80 border-white/10'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-2xl shrink-0 ${
                result.hasWon
                  ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              {result.hasWon ? (
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              ) : (
                <AlertCircle className="w-7 h-7 text-slate-400" />
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    result.hasWon
                      ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {result.category}
                </span>

                <span className="text-xl sm:text-2xl font-display font-black text-amber-300">
                  {result.prizeAmount}
                </span>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {result.description}
              </p>

              {result.matchedMain.length > 0 && (
                <div className="flex items-center gap-2 pt-2 text-xs font-mono text-slate-400">
                  <span>Números / Cifras coincidentes:</span>
                  <div className="flex gap-1.5">
                    {result.matchedMain.map((n, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 font-bold"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.allSecosWon && result.allSecosWon.length > 0 && (
                <div className="p-3 rounded-xl bg-cosmos-900/80 border border-emerald-400/30 text-xs font-mono text-emerald-300 mt-2">
                  <span className="font-bold block text-white mb-1">Subpremios acreditados:</span>
                  {result.allSecosWon.map((s, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>• {s.name}</span>
                      <span className="font-bold text-amber-300">{s.prize}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
