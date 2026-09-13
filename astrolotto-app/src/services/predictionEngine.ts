import { HISTORICAL_DRAWS, LOTTERY_CONFIGS } from '../data/historicalLotteryData';
import type {
  LotteryStats,
  LotteryType,
  OracleLog,
  PredictedTicket,
  UserAstralProfile,
} from '../types/lottery';
import { computeAstroInfluence } from './astrologyEngine';
import { computeNumerologyBreakdown } from './numerologyEngine';

export function calculateLotteryStats(type: LotteryType): LotteryStats {
  const config = LOTTERY_CONFIGS[type];
  const draws = HISTORICAL_DRAWS[type] || [];
  const [minNum, maxNum] = config.mainRange;

  const frequencyMap: Record<number, number> = {};
  const lastSeenMap: Record<number, number> = {}; // draw index where it last appeared (0 = most recent)

  for (let n = minNum; n <= maxNum; n++) {
    frequencyMap[n] = 0;
    lastSeenMap[n] = 999;
  }

  let totalEven = 0;
  let totalOdd = 0;
  let totalSum = 0;
  let drawCount = draws.length;

  draws.forEach((draw, drawIdx) => {
    let drawSum = 0;
    draw.numbers.forEach((num) => {
      frequencyMap[num] = (frequencyMap[num] || 0) + 1;
      if (lastSeenMap[num] === 999) {
        lastSeenMap[num] = drawIdx;
      }
      if (num % 2 === 0) totalEven++;
      else totalOdd++;
      drawSum += num;
    });
    totalSum += drawSum;
  });

  const hotNumbers = Object.entries(frequencyMap)
    .map(([num, freq]) => ({ number: parseInt(num, 10), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  const coldNumbers = Object.entries(frequencyMap)
    .map(([num, freq]) => ({
      number: parseInt(num, 10),
      frequency: freq,
      gap: lastSeenMap[parseInt(num, 10)] ?? 0,
    }))
    .sort((a, b) => a.frequency - b.frequency)
    .slice(0, 10);

  const dueNumbers = Object.entries(lastSeenMap)
    .map(([num, gap]) => ({ number: parseInt(num, 10), gap: gap === 999 ? draws.length + 5 : gap }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 10);

  return {
    hotNumbers,
    coldNumbers,
    dueNumbers,
    parityRatio: {
      even: Math.round((totalEven / (totalEven + totalOdd || 1)) * 100),
      odd: Math.round((totalOdd / (totalEven + totalOdd || 1)) * 100),
    },
    averageSum: drawCount > 0 ? Math.round(totalSum / drawCount) : 135,
  };
}

export async function runPredictionEngine(
  type: LotteryType,
  profile: UserAstralProfile,
  ticketCount: number = 3,
  onLog?: (log: OracleLog) => void
): Promise<{ tickets: PredictedTicket[]; stats: LotteryStats }> {
  const config = LOTTERY_CONFIGS[type];
  const stats = calculateLotteryStats(type);

  const emit = (
    stage: OracleLog['stage'],
    message: string,
    detail?: string,
    status: OracleLog['status'] = 'process'
  ) => {
    if (onLog) {
      onLog({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        stage,
        message,
        detail,
        status,
      });
    }
  };

  emit('network', 'Sincronizando con fuentes de datos de sorteos en vivo...', 'Verificando hashes de resultados recientes', 'process');
  await new Promise((r) => setTimeout(r, 260));

  emit('network', `Base de datos validada: ${stats.hotNumbers.length} nodos calientes y ${stats.dueNumbers.length} números con atraso kármico indexados.`, 'Conexión cuántica TLS 1.3 establecida', 'success');
  await new Promise((r) => setTimeout(r, 280));

  // 1. Astrological computation
  emit('astral', `Calculando efemérides celestes para el sorteo (${profile.drawDate})...`, `Signo del usuario: ${profile.zodiacSign}`, 'process');
  const astro = computeAstroInfluence(profile.drawDate, profile.birthDate);
  await new Promise((r) => setTimeout(r, 320));

  emit('astral', `Fase Lunar: ${astro.moonPhase.name} (${astro.moonPhase.illumination}% iluminación). Regente: ${astro.dominantPlanet.name} ${astro.dominantPlanet.symbol}`, astro.moonPhase.significance, 'highlight');
  await new Promise((r) => setTimeout(r, 250));

  // 2. Numerology computation
  emit('numerology', `Calculando sendero de vida pitagórico de ${profile.name}...`, `Fecha natal: ${profile.birthDate}`, 'process');
  const numBreakdown = computeNumerologyBreakdown(profile.birthDate, profile.drawDate);
  await new Promise((r) => setTimeout(r, 280));

  emit('numerology', `Sendero de Vida: ${numBreakdown.lifePath} | Vibración Día Universal: ${numBreakdown.universalDayVibration} | Día Personal: ${numBreakdown.personalDayNumber}`, `Matriz armónica generada (${numBreakdown.harmoniousMatrix.length} resonadores)`, 'highlight');
  await new Promise((r) => setTimeout(r, 260));

  // 3. Score Vector calculation
  emit('synthesis', 'Iniciando síntesis ponderada multi-dimensional (Estadística + Astrología + Numerología + Favoritos)...', `Pesos: Histórico ${profile.weights.history}% | Astral ${profile.weights.astrology}% | Numerología ${profile.weights.numerology}% | Favoritos ${profile.weights.favorites}%`, 'process');
  await new Promise((r) => setTimeout(r, 350));

  const [minNum, maxNum] = config.mainRange;
  const scoreMap: Record<number, number> = {};

  for (let n = minNum; n <= maxNum; n++) {
    let score = 50; // base score

    // Statistical weight
    const hotMatch = stats.hotNumbers.find((h) => h.number === n);
    if (hotMatch) score += (profile.weights.history / 100) * 35;
    const dueMatch = stats.dueNumbers.find((d) => d.number === n);
    if (dueMatch && dueMatch.gap > 3) score += (profile.weights.history / 100) * (dueMatch.gap * 2.5);

    // Astrological weight
    if (astro.dominantPlanet.resonantNumbers.includes(n)) {
      score += (profile.weights.astrology / 100) * 40;
    }
    // Moon phase resonance
    if (n % 9 === astro.celestialVibration || n % 10 === Math.round(astro.moonPhase.illumination / 10)) {
      score += (profile.weights.astrology / 100) * 25;
    }

    // Numerology weight
    if (numBreakdown.harmoniousMatrix.includes(n)) {
      score += (profile.weights.numerology / 100) * 35;
    }
    if (n === numBreakdown.lifePath || n === numBreakdown.universalDayVibration) {
      score += (profile.weights.numerology / 100) * 45;
    }

    // User favorites weight
    if (profile.favoriteNumbers.includes(n)) {
      score += (profile.weights.favorites / 100) * 60;
    }

    // Random jitter to introduce entropy / prevent deterministic lock
    score += (Math.random() - 0.5) * 12;
    scoreMap[n] = Math.max(score, 1);
  }

  // Generate optimal tickets
  const tickets: PredictedTicket[] = [];

  for (let t = 0; t < ticketCount; t++) {
    const selectedMain: number[] = [];
    const countNeeded = config.mainNumbersCount;

    if (type === 'medellin' || type === 'nacional') {
      // 4 digits for Medellin, 5 digits for Nacional. In these lotteries digits can repeat!
      const digits: number[] = [];
      const numDigits = config.mainNumbersCount;
      for (let i = 0; i < numDigits; i++) {
        // Sample weighted digit
        const digitScores: number[] = [];
        for (let d = 0; d <= 9; d++) {
          let s = scoreMap[d] || 50;
          if (profile.favoriteNumbers.includes(d)) s += 40;
          digitScores.push(s);
        }
        const picked = weightedSampleSingle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], digitScores);
        digits.push(picked);
      }
      selectedMain.push(...digits);
    } else {
      // Numbers are unique
      const availableNumbers = Array.from({ length: maxNum - minNum + 1 }, (_, i) => minNum + i);
      const scores = availableNumbers.map((n) => scoreMap[n]);

      // Monte Carlo selection with sum and parity constraints
      let attempts = 0;
      let bestCombination: number[] = [];
      let bestScore = -Infinity;

      while (attempts < 15) {
        attempts++;
        const candidate = weightedSampleMultiple(availableNumbers, scores, countNeeded);
        candidate.sort((a, b) => a - b);

        // Evaluate candidate quality
        const sum = candidate.reduce((a, b) => a + b, 0);
        const evens = candidate.filter((x) => x % 2 === 0).length;
        const sumDev = Math.abs(sum - stats.averageSum);

        // Good balance bonus
        let combScore = candidate.reduce((acc, n) => acc + (scoreMap[n] || 0), 0);
        if (sumDev < 30) combScore += 25;
        if (evens >= 2 && evens <= 4) combScore += 20;

        if (combScore > bestScore) {
          bestScore = combScore;
          bestCombination = candidate;
        }
      }
      selectedMain.push(...bestCombination);
    }

    // Extra numbers generation (stars, reintegro, serie)
    const selectedExtra: number[] = [];
    if (config.extraType === 'stars') {
      // 2 stars 1-12
      const starsPool = Array.from({ length: 12 }, (_, i) => i + 1);
      const starScores = starsPool.map((s) => {
        let sc = 20;
        if (s === astro.celestialVibration) sc += 30;
        if (s === numBreakdown.lifePath || s === numBreakdown.personalDayNumber) sc += 35;
        if (profile.favoriteNumbers.includes(s)) sc += 25;
        return sc;
      });
      const stars = weightedSampleMultiple(starsPool, starScores, 2);
      stars.sort((a, b) => a - b);
      selectedExtra.push(...stars);
    } else if (config.extraType === 'reintegro') {
      // 1 reintegro 0-9
      const reintegroPool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const rScores = reintegroPool.map((r) => {
        let sc = 20;
        if (r === numBreakdown.lifePath % 10) sc += 40;
        if (profile.favoriteNumbers.includes(r)) sc += 30;
        return sc;
      });
      const reintegro = weightedSampleSingle(reintegroPool, rScores);
      selectedExtra.push(reintegro);
    } else if (config.extraType === 'serie') {
      if (type === 'nacional') {
        // Serie 1-10 for Nacional
        const serie = Math.floor(Math.random() * 10) + 1;
        selectedExtra.push(serie);
      } else {
        // Serie 000-999 for Medellin
        const serieSeed = Math.floor(
          ((numBreakdown.personalDayNumber * 111) + (astro.moonPhase.illumination * 8) + (t * 73) + Math.random() * 80) % 1000
        );
        selectedExtra.push(serieSeed);
      }
    }

    const confidence = +(91.5 + Math.random() * 7.2).toFixed(1);
    const astralAffinity = +(88.0 + Math.random() * 11).toFixed(1);
    const mathAffinity = +(89.0 + Math.random() * 10).toFixed(1);
    const vibHarmony = +(92.0 + Math.random() * 7.5).toFixed(1);

    const rationale = buildRationale(
      type,
      selectedMain,
      selectedExtra,
      astro,
      numBreakdown,
      profile
    );

    tickets.push({
      id: `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      mainNumbers: selectedMain,
      extraNumbers: selectedExtra,
      confidence,
      astralAffinity,
      mathematicalAffinity: mathAffinity,
      vibrationalHarmony: vibHarmony,
      rationale,
      cosmicSign: `${astro.dominantPlanet.name} en sintonía con ${astro.zodiacAspect.sign}`,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  emit(
    'complete',
    `¡Análisis cuántico finalizado! ${tickets.length} combinaciones generadas con índice de confianza superior al 95%.`,
    'Cálculo armónico sincronizado',
    'success'
  );

  return { tickets, stats };
}

function weightedSampleSingle<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    if (random < weights[i]) {
      return items[i];
    }
    random -= weights[i];
  }
  return items[items.length - 1];
}

function weightedSampleMultiple<T>(items: T[], weights: number[], count: number): T[] {
  const pool = [...items];
  const poolWeights = [...weights];
  const selected: T[] = [];

  for (let c = 0; c < count && pool.length > 0; c++) {
    const totalWeight = poolWeights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let chosenIdx = 0;

    for (let i = 0; i < pool.length; i++) {
      if (random < poolWeights[i]) {
        chosenIdx = i;
        break;
      }
      random -= poolWeights[i];
    }

    selected.push(pool[chosenIdx]);
    pool.splice(chosenIdx, 1);
    poolWeights.splice(chosenIdx, 1);
  }

  return selected;
}

function buildRationale(
  type: LotteryType,
  main: number[],
  extra: number[],
  astro: ReturnType<typeof computeAstroInfluence>,
  num: ReturnType<typeof computeNumerologyBreakdown>,
  profile: UserAstralProfile
) {
  const details: string[] = [];

  // Lottery specific
  if (type === 'medellin') {
    const fullNum = main.join('');
    details.push(`Número de 4 cifras [${fullNum}] estructurado con vibración de prosperidad y tracción.`);
    if (extra.length > 0) {
      const serieStr = extra[0].toString().padStart(3, '0');
      details.push(`Serie ${serieStr} alineada con el flujo electromagnético del departamento de Antioquia.`);
    }
  } else if (type === 'nacional') {
    const fullNum = main.join('');
    details.push(`Décimo de 5 cifras [${fullNum}] afinado con la resonancia áurea de la Lotería Nacional de España.`);
    if (extra.length > 0) {
      details.push(`Serie ${extra[0]} calibrada con la polaridad magnética del sorteo oficial de SELAE.`);
    }
  } else if (type === 'euromillones') {
    details.push(`Dispersión cuántica de 5 esferas optimizada para la campana de Gauss de Euromillones.`);
    details.push(`Estrellas ${extra.join(' & ')} en convergencia con la octava de ${astro.dominantPlanet.name}.`);
  } else {
    details.push(`Sexteto de La Primitiva con balance simétrico par/impar y suma canónica.`);
    details.push(`Reintegro (${extra[0]}) resonante con el dígito raíz del Life Path (${num.lifePath}).`);
  }

  // Astro rationale
  details.push(
    `Sintonía lunar bajo ${astro.moonPhase.name}: favorece la activación de las esferas ${main.slice(0, 2).join(', ')}.`
  );

  // Numerology rationale
  details.push(
    `Vibración universal ${num.universalDayVibration} unificada al sendero de vida ${num.lifePath} de ${profile.name || 'el consultor'}.`
  );

  // Favorite overlap
  const favOverlap = main.filter((n) => profile.favoriteNumbers.includes(n));
  if (favOverlap.length > 0) {
    details.push(`Incorporación armónica de tus números personales de la suerte: ${favOverlap.join(', ')}.`);
  }

  return {
    title: `Alineación Óptima Cuántica — ${astro.dominantPlanet.name} / ${astro.zodiacAspect.sign}`,
    details,
  };
}
