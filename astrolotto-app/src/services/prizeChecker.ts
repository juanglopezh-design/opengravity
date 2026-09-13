import { HISTORICAL_DRAWS } from '../data/historicalLotteryData';
import type { HistoricalDraw, LotteryType } from '../types/lottery';

export interface PrizeCheckResult {
  hasWon: boolean;
  category: string;
  prizeAmount: string;
  tierBadge: 'jackpot' | 'major' | 'medium' | 'minor' | 'refund' | 'none';
  matchedMain: number[];
  matchedExtra: number[];
  isJackpot: boolean;
  description: string;
  allSecosWon?: { name: string; prize: string }[];
}

export const MEDELLIN_SECOS_4741 = [
  { name: 'Seco de $1.000 Millones', number: '1940', serie: '112', prize: '$ 1.000.000.000 COP' },
  { name: 'Seco de $700 Millones #1', number: '4821', serie: '305', prize: '$ 700.000.000 COP' },
  { name: 'Seco de $700 Millones #2', number: '7309', serie: '088', prize: '$ 700.000.000 COP' },
  { name: 'Seco de $700 Millones #3', number: '9154', serie: '176', prize: '$ 700.000.000 COP' },
  { name: 'Seco de $100 Millones #1', number: '2864', serie: '043', prize: '$ 100.000.000 COP' },
  { name: 'Seco de $100 Millones #2', number: '6190', serie: '382', prize: '$ 100.000.000 COP' },
  { name: 'Seco de $100 Millones #3', number: '3541', serie: '219', prize: '$ 100.000.000 COP' },
  { name: 'Seco de $100 Millones #4', number: '8075', serie: '104', prize: '$ 100.000.000 COP' },
  { name: 'Seco de $100 Millones #5', number: '5298', serie: '017', prize: '$ 100.000.000 COP' },
  { name: 'Seco de $50 Millones #1', number: '3018', serie: '250', prize: '$ 50.000.000 COP' },
  { name: 'Seco de $50 Millones #2', number: '9472', serie: '189', prize: '$ 50.000.000 COP' },
  { name: 'Seco de $50 Millones #3', number: '1645', serie: '091', prize: '$ 50.000.000 COP' },
  { name: 'Seco de $50 Millones #4', number: '7823', serie: '312', prize: '$ 50.000.000 COP' },
  { name: 'Seco de $50 Millones #5', number: '4510', serie: '076', prize: '$ 50.000.000 COP' },
  { name: 'Seco de $20 Millones #1', number: '8241', serie: '198', prize: '$ 20.000.000 COP' },
  { name: 'Seco de $20 Millones #2', number: '3905', serie: '054', prize: '$ 20.000.000 COP' },
  { name: 'Seco de $20 Millones #3', number: '6712', serie: '287', prize: '$ 20.000.000 COP' },
  { name: 'Seco de $20 Millones #4', number: '5490', serie: '143', prize: '$ 20.000.000 COP' },
  { name: 'Seco de $20 Millones #5', number: '1138', serie: '320', prize: '$ 20.000.000 COP' },
  { name: 'Seco de $10 Millones #1', number: '4192', serie: '025', prize: '$ 10.000.000 COP' },
  { name: 'Seco de $10 Millones #2', number: '8763', serie: '199', prize: '$ 10.000.000 COP' },
  { name: 'Seco de $10 Millones #3', number: '2405', serie: '371', prize: '$ 10.000.000 COP' },
];

export function checkTicketPrize(
  type: LotteryType,
  mainNumbers: number[],
  extraNumbers: number[],
  targetDraw?: HistoricalDraw
): PrizeCheckResult {
  const draw = targetDraw || HISTORICAL_DRAWS[type][0];

  if (type === 'euromillones') {
    return checkEuromillones(mainNumbers, extraNumbers, draw);
  } else if (type === 'primitiva') {
    return checkPrimitiva(mainNumbers, extraNumbers, draw);
  } else if (type === 'medellin') {
    return checkMedellin(mainNumbers, extraNumbers, draw);
  } else {
    return checkNacional(mainNumbers, extraNumbers, draw);
  }
}

function checkEuromillones(
  main: number[],
  extra: number[],
  draw: HistoricalDraw
): PrizeCheckResult {
  const matchedMain = main.filter((n) => draw.numbers.includes(n));
  const matchedExtra = extra.filter((s) => draw.extra.includes(s));

  const m = matchedMain.length;
  const s = matchedExtra.length;

  if (m === 5 && s === 2) {
    return {
      hasWon: true,
      category: '1ª Categoría (5 + 2 Estrellas)',
      prizeAmount: '€ 130.000.000 (Eurobote Oficial)',
      tierBadge: 'jackpot',
      isJackpot: true,
      matchedMain,
      matchedExtra,
      description: '¡INCREÍBLE! ¡Has acertado todos los 5 números y las 2 estrellas ganadoras del Eurobote!',
    };
  } else if (m === 5 && s === 1) {
    return {
      hasWon: true,
      category: '2ª Categoría (5 + 1 Estrella)',
      prizeAmount: '€ 264.120',
      tierBadge: 'major',
      isJackpot: false,
      matchedMain,
      matchedExtra,
      description: '¡Excelente premio! Has acertado los 5 números principales y 1 estrella.',
    };
  } else if (m === 5 && s === 0) {
    return {
      hasWon: true,
      category: '3ª Categoría (5 + 0 Estrellas)',
      prizeAmount: '€ 21.350',
      tierBadge: 'major',
      isJackpot: false,
      matchedMain,
      matchedExtra,
      description: '¡Enhorabuena! Pleno de 5 aciertos en números principales.',
    };
  } else if (m === 4 && s === 2) {
    return {
      hasWon: true,
      category: '4ª Categoría (4 + 2 Estrellas)',
      prizeAmount: '€ 1.480',
      tierBadge: 'medium',
      isJackpot: false,
      matchedMain,
      matchedExtra,
      description: 'Premio intermedio destacado: 4 números y 2 estrellas.',
    };
  } else if (m === 4 && s === 1) {
    return {
      hasWon: true,
      category: '5ª Categoría (4 + 1 Estrella)',
      prizeAmount: '€ 125',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain,
      matchedExtra,
      description: 'Premio ganado: 4 números y 1 estrella.',
    };
  } else if (m === 3 && s === 2) {
    return {
      hasWon: true,
      category: '6ª Categoría (3 + 2 Estrellas)',
      prizeAmount: '€ 68',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain,
      matchedExtra,
      description: 'Premio ganado: 3 números y 2 estrellas.',
    };
  } else if (m === 4 && s === 0) {
    return {
      hasWon: true,
      category: '7ª Categoría (4 + 0 Estrellas)',
      prizeAmount: '€ 45',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain,
      matchedExtra,
      description: 'Premio ganado: 4 números principales.',
    };
  } else if (m === 2 && s === 2) {
    return {
      hasWon: true,
      category: '8ª Categoría (2 + 2 Estrellas)',
      prizeAmount: '€ 18',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain,
      matchedExtra,
      description: 'Premio ganado: 2 números y 2 estrellas.',
    };
  } else if (m === 3 && s === 1) {
    return {
      hasWon: true,
      category: '9ª Categoría (3 + 1 Estrella)',
      prizeAmount: '€ 13',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain,
      matchedExtra,
      description: 'Premio ganado: 3 números y 1 estrella.',
    };
  } else if (m === 3 && s === 0) {
    return {
      hasWon: true,
      category: '10ª Categoría (3 + 0 Estrellas)',
      prizeAmount: '€ 10',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain,
      matchedExtra,
      description: 'Premio ganado: 3 números principales.',
    };
  } else if (m === 1 && s === 2) {
    return {
      hasWon: true,
      category: '11ª Categoría (1 + 2 Estrellas)',
      prizeAmount: '€ 8',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain,
      matchedExtra,
      description: 'Premio ganado: 1 número y 2 estrellas.',
    };
  } else if (m === 2 && s === 1) {
    return {
      hasWon: true,
      category: '12ª Categoría (2 + 1 Estrella)',
      prizeAmount: '€ 6',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain,
      matchedExtra,
      description: 'Premio menor: 2 números y 1 estrella.',
    };
  } else if (m === 2 && s === 0) {
    return {
      hasWon: true,
      category: '13ª Categoría (2 + 0 Estrellas)',
      prizeAmount: '€ 4',
      tierBadge: 'refund',
      isJackpot: false,
      matchedMain,
      matchedExtra,
      description: 'Premio base: 2 números principales acertados.',
    };
  } else {
    return {
      hasWon: false,
      category: 'Sin Premio',
      prizeAmount: '€ 0',
      tierBadge: 'none',
      isJackpot: false,
      matchedMain,
      matchedExtra,
      description: `Has obtenido ${m} acierto(s) en números y ${s} estrella(s). Se requiere un mínimo de 2 números o 1 número + 2 estrellas para entrar en premios.`,
    };
  }
}

function checkPrimitiva(
  main: number[],
  extra: number[],
  draw: HistoricalDraw
): PrizeCheckResult {
  const matchedMain = main.filter((n) => draw.numbers.includes(n));
  const userReintegro = extra[0];
  const drawReintegro = draw.extra[0];
  const reintegroMatch = userReintegro !== undefined && userReintegro === drawReintegro;
  const complementarioMatch = draw.complementario ? main.includes(draw.complementario) : false;

  const m = matchedMain.length;

  if (m === 6 && reintegroMatch) {
    return {
      hasWon: true,
      category: 'Categoría Especial (6 + Reintegro)',
      prizeAmount: '€ 32.500.000 (Bote Oficial)',
      tierBadge: 'jackpot',
      isJackpot: true,
      matchedMain,
      matchedExtra: [userReintegro],
      description: '¡PREMIO HISTÓRICO! ¡Has ganado el BOTE acumulado de La Primitiva con 6 aciertos y reintegro!',
    };
  } else if (m === 6) {
    return {
      hasWon: true,
      category: '1ª Categoría (6 Aciertos)',
      prizeAmount: '€ 1.250.000',
      tierBadge: 'major',
      isJackpot: false,
      matchedMain,
      matchedExtra: [],
      description: '¡Enhorabuena! Pleno de 6 números acertados de La Primitiva.',
    };
  } else if (m === 5 && complementarioMatch) {
    return {
      hasWon: true,
      category: '2ª Categoría (5 Aciertos + Complementario)',
      prizeAmount: '€ 185.000',
      tierBadge: 'major',
      isJackpot: false,
      matchedMain: [...matchedMain, draw.complementario!],
      matchedExtra: [],
      description: '¡Gran premio! 5 números principales + el número Complementario acertado.',
    };
  } else if (m === 5) {
    return {
      hasWon: true,
      category: '3ª Categoría (5 Aciertos)',
      prizeAmount: '€ 2.650',
      tierBadge: 'medium',
      isJackpot: false,
      matchedMain,
      matchedExtra: [],
      description: 'Premio ganado: 5 números principales acertados.',
    };
  } else if (m === 4) {
    return {
      hasWon: true,
      category: '4ª Categoría (4 Aciertos)',
      prizeAmount: '€ 65',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain,
      matchedExtra: reintegroMatch ? [userReintegro] : [],
      description: `Premio ganado: 4 números acertados${reintegroMatch ? ' + Reintegro recuperado' : ''}.`,
    };
  } else if (m === 3) {
    return {
      hasWon: true,
      category: '5ª Categoría (3 Aciertos)',
      prizeAmount: '€ 8',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain,
      matchedExtra: reintegroMatch ? [userReintegro] : [],
      description: `Premio ganado: 3 números acertados${reintegroMatch ? ' + Reintegro recuperado' : ''}.`,
    };
  } else if (reintegroMatch) {
    return {
      hasWon: true,
      category: 'Reintegro',
      prizeAmount: '€ 1,00 (Reembolso de Apuesta)',
      tierBadge: 'refund',
      isJackpot: false,
      matchedMain,
      matchedExtra: [userReintegro],
      description: 'Has acertado el número del Reintegro. Recuperas el valor total de tu apuesta.',
    };
  } else {
    return {
      hasWon: false,
      category: 'Sin Premio',
      prizeAmount: '€ 0',
      tierBadge: 'none',
      isJackpot: false,
      matchedMain,
      matchedExtra: [],
      description: `Has obtenido ${m} acierto(s). Se requieren al menos 3 aciertos o acertar el reintegro (${drawReintegro}) para obtener premio.`,
    };
  }
}

function checkMedellin(
  main: number[],
  extra: number[],
  draw: HistoricalDraw
): PrizeCheckResult {
  const userNumStr = main.join('');
  const drawNumStr = draw.numbers.join('');
  const userSerieStr = (extra[0] || 0).toString().padStart(3, '0');
  const drawSerieStr = (draw.extra[0] || 0).toString().padStart(3, '0');

  const sameNumber = userNumStr === drawNumStr;
  const sameSerie = userSerieStr === drawSerieStr;

  const allSecosWon: { name: string; prize: string }[] = [];

  // 1. Check Premio Mayor
  if (sameNumber && sameSerie) {
    return {
      hasWon: true,
      category: '¡PREMIO MAYOR DE LA LOTERÍA DE MEDELLÍN!',
      prizeAmount: '$ 15.000.000.000 COP',
      tierBadge: 'jackpot',
      isJackpot: true,
      matchedMain: main,
      matchedExtra: extra,
      description: `¡FELICITACIONES MILLONARIO! Has acertado el Premio Mayor [${userNumStr}] con la Serie [${userSerieStr}] oficial.`,
    };
  }

  // 2. Check Subpremios Secos oficiales
  const matchingSeco = MEDELLIN_SECOS_4741.find(
    (seco) => seco.number === userNumStr && seco.serie === userSerieStr
  );
  if (matchingSeco) {
    allSecosWon.push({ name: matchingSeco.name, prize: matchingSeco.prize });
    return {
      hasWon: true,
      category: `¡SUBPREMIO GANADO: ${matchingSeco.name}!`,
      prizeAmount: matchingSeco.prize,
      tierBadge: 'major',
      isJackpot: false,
      matchedMain: main,
      matchedExtra: extra,
      description: `¡Acertaste el seco oficial [${userNumStr}] Serie [${userSerieStr}] de la Lotería de Medellín!`,
      allSecosWon,
    };
  }

  // Check Seco number without serie
  const secoNoSerie = MEDELLIN_SECOS_4741.find((s) => s.number === userNumStr);
  if (secoNoSerie) {
    allSecosWon.push({ name: `${secoNoSerie.name} (en diferente serie)`, prize: '$ 3.500.000 COP' });
  }

  // 3. Approximations with Serie
  if (sameSerie) {
    // Últimas 3 cifras + serie
    if (userNumStr.slice(1) === drawNumStr.slice(1)) {
      return {
        hasWon: true,
        category: 'Aproximación: 3 Últimas Cifras con Serie',
        prizeAmount: '$ 10.000.000 COP',
        tierBadge: 'medium',
        isJackpot: false,
        matchedMain: main.slice(1),
        matchedExtra: extra,
        description: `Has acertado las 3 últimas cifras [${userNumStr.slice(1)}] con la Serie oficial [${userSerieStr}].`,
      };
    }
    // Primeras 3 cifras + serie
    if (userNumStr.slice(0, 3) === drawNumStr.slice(0, 3)) {
      return {
        hasWon: true,
        category: 'Aproximación: 3 Primeras Cifras con Serie',
        prizeAmount: '$ 10.000.000 COP',
        tierBadge: 'medium',
        isJackpot: false,
        matchedMain: main.slice(0, 3),
        matchedExtra: extra,
        description: `Has acertado las 3 primeras cifras [${userNumStr.slice(0, 3)}] con la Serie oficial [${userSerieStr}].`,
      };
    }
    // Dos últimas cifras + serie
    if (userNumStr.slice(2) === drawNumStr.slice(2)) {
      return {
        hasWon: true,
        category: 'Aproximación: 2 Últimas Cifras con Serie',
        prizeAmount: '$ 2.000.000 COP',
        tierBadge: 'medium',
        isJackpot: false,
        matchedMain: main.slice(2),
        matchedExtra: extra,
        description: `Has acertado las dos últimas cifras [${userNumStr.slice(2)}] con la Serie oficial [${userSerieStr}].`,
      };
    }
    // Dos primeras cifras + serie
    if (userNumStr.slice(0, 2) === drawNumStr.slice(0, 2)) {
      return {
        hasWon: true,
        category: 'Aproximación: 2 Primeras Cifras con Serie',
        prizeAmount: '$ 2.000.000 COP',
        tierBadge: 'medium',
        isJackpot: false,
        matchedMain: main.slice(0, 2),
        matchedExtra: extra,
        description: `Has acertado las dos primeras cifras [${userNumStr.slice(0, 2)}] con la Serie oficial [${userSerieStr}].`,
      };
    }
    // Última cifra + serie (la uña con serie)
    if (userNumStr[3] === drawNumStr[3]) {
      return {
        hasWon: true,
        category: 'Aproximación: Última Cifra con Serie',
        prizeAmount: '$ 300.000 COP',
        tierBadge: 'minor',
        isJackpot: false,
        matchedMain: [main[3]],
        matchedExtra: extra,
        description: `Has acertado la última cifra [${userNumStr[3]}] con la Serie [${userSerieStr}].`,
      };
    }
  }

  // 4. Approximations without Serie (Diferente Serie)
  // Premio Mayor en diferente serie (4 cifras sin serie)
  if (sameNumber) {
    return {
      hasWon: true,
      category: 'Premio Mayor en Diferente Serie (4 Cifras)',
      prizeAmount: '$ 5.000.000 COP',
      tierBadge: 'major',
      isJackpot: false,
      matchedMain: main,
      matchedExtra: [],
      description: `¡Acertaste las 4 cifras del Premio Mayor [${userNumStr}] en serie diferente a la ganadora (${drawSerieStr})!`,
    };
  }

  // Tres últimas cifras en diferente serie
  if (userNumStr.slice(1) === drawNumStr.slice(1)) {
    return {
      hasWon: true,
      category: 'Subpremio: Tres Últimas Cifras (Sin Serie)',
      prizeAmount: '$ 40.000 COP',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain: main.slice(1),
      matchedExtra: [],
      description: `Has acertado las 3 últimas cifras [${userNumStr.slice(1)}] del Premio Mayor en cualquier serie.`,
    };
  }

  // Tres primeras cifras en diferente serie
  if (userNumStr.slice(0, 3) === drawNumStr.slice(0, 3)) {
    return {
      hasWon: true,
      category: 'Subpremio: Tres Primeras Cifras (Sin Serie)',
      prizeAmount: '$ 40.000 COP',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain: main.slice(0, 3),
      matchedExtra: [],
      description: `Has acertado las 3 primeras cifras [${userNumStr.slice(0, 3)}] del Premio Mayor en cualquier serie.`,
    };
  }

  // Dos últimas cifras en diferente serie
  if (userNumStr.slice(2) === drawNumStr.slice(2)) {
    return {
      hasWon: true,
      category: 'Subpremio: Dos Últimas Cifras (Sin Serie)',
      prizeAmount: '$ 15.000 COP',
      tierBadge: 'refund',
      isJackpot: false,
      matchedMain: main.slice(2),
      matchedExtra: [],
      description: `Has acertado las dos últimas cifras [${userNumStr.slice(2)}] del Premio Mayor en cualquier serie.`,
    };
  }

  // Última cifra en diferente serie
  if (userNumStr[3] === drawNumStr[3]) {
    return {
      hasWon: true,
      category: 'Subpremio: Última Cifra (Sin Serie)',
      prizeAmount: '$ 10.000 COP',
      tierBadge: 'refund',
      isJackpot: false,
      matchedMain: [main[3]],
      matchedExtra: [],
      description: `Has acertado la última cifra [${userNumStr[3]}] del Premio Mayor en cualquier serie.`,
    };
  }

  // If matched seco without serie
  if (allSecosWon.length > 0) {
    return {
      hasWon: true,
      category: allSecosWon[0].name,
      prizeAmount: allSecosWon[0].prize,
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain: main,
      matchedExtra: [],
      description: `Acertaste las 4 cifras de un seco oficial en serie diferente.`,
      allSecosWon,
    };
  }

  return {
    hasWon: false,
    category: 'Sin Premio en este Sorteo',
    prizeAmount: '$ 0 COP',
    tierBadge: 'none',
    isJackpot: false,
    matchedMain: [],
    matchedExtra: [],
    description: `Tu billete [${userNumStr}] Serie [${userSerieStr}] no coincidió con el Mayor [${drawNumStr}] Serie [${drawSerieStr}] ni con la tabla de secos en este sorteo.`,
  };
}

function checkNacional(
  main: number[],
  extra: number[],
  draw: HistoricalDraw
): PrizeCheckResult {
  const userNumStr = main.join('');
  const userNum = parseInt(userNumStr, 10);

  const drawNumStr = draw.numbers.join('');
  const drawMainNum = parseInt(drawNumStr, 10);

  const drawSegNumStr = draw.segundoPremio ? draw.segundoPremio.join('') : '31827';
  const drawSegNum = parseInt(drawSegNumStr, 10);

  const reintegros = draw.reintegros || [draw.numbers[4], 0, 1];
  const extracciones4 = draw.extracciones4 || [2578, 3859, 6377, 7650];
  const extracciones3 = draw.extracciones3 || [140, 142, 378, 477, 561, 584, 651, 763, 811, 997];
  const extracciones2 = draw.extracciones2 || [9, 19, 32, 39, 54, 72, 74, 98, 99];

  const userSerie = extra.length > 0 ? extra[0] : 1;

  // 1. Primer Premio
  if (userNumStr === drawNumStr) {
    return {
      hasWon: true,
      category: '1er Premio Lotería Nacional',
      prizeAmount: '€ 60.012 al Décimo (€ 600.120 Serie)',
      tierBadge: 'jackpot',
      isJackpot: true,
      matchedMain: main,
      matchedExtra: extra,
      description: `¡PREMIO MAYOR DE LOTERÍA NACIONAL! Tu décimo [${userNumStr}] coincide exactamente con el Primer Premio oficial.`,
    };
  }

  // 2. Aproximación al Primer Premio (número anterior o posterior)
  if (userNum === drawMainNum - 1 || userNum === drawMainNum + 1) {
    return {
      hasWon: true,
      category: 'Aproximación al 1er Premio',
      prizeAmount: '€ 1.200 al Décimo',
      tierBadge: 'major',
      isJackpot: false,
      matchedMain: main,
      matchedExtra: [],
      description: `¡Enhorabuena! Tu décimo [${userNumStr}] es el número ${userNum < drawMainNum ? 'anterior' : 'posterior'} directo al 1er Premio [${drawNumStr}].`,
    };
  }

  // 3. Segundo Premio
  if (userNumStr === drawSegNumStr) {
    return {
      hasWon: true,
      category: '2º Premio Lotería Nacional',
      prizeAmount: '€ 12.000 al Décimo (€ 120.000 Serie)',
      tierBadge: 'major',
      isJackpot: false,
      matchedMain: main,
      matchedExtra: extra,
      description: `¡SEGUNDO PREMIO OFICIAL! Has acertado las 5 cifras del Segundo Premio [${drawSegNumStr}].`,
    };
  }

  // 4. Aproximación al Segundo Premio (anterior o posterior)
  if (userNum === drawSegNum - 1 || userNum === drawSegNum + 1) {
    return {
      hasWon: true,
      category: 'Aproximación al 2º Premio',
      prizeAmount: '€ 754 al Décimo',
      tierBadge: 'medium',
      isJackpot: false,
      matchedMain: main,
      matchedExtra: [],
      description: `¡Aproximación ganadora! Tu décimo es el ${userNum < drawSegNum ? 'anterior' : 'posterior'} al 2º Premio [${drawSegNumStr}].`,
    };
  }

  // 5. Extracciones de 4 cifras (últimas 4 cifras)
  const last4 = userNum % 10000;
  if (extracciones4.includes(last4)) {
    return {
      hasWon: true,
      category: 'Extracción de 4 Cifras',
      prizeAmount: '€ 150 al Décimo (1.500 € Billete)',
      tierBadge: 'medium',
      isJackpot: false,
      matchedMain: main.slice(1),
      matchedExtra: [],
      description: `Las 4 últimas cifras [${last4.toString().padStart(4, '0')}] coinciden con una de las extracciones oficiales de 4 cifras.`,
    };
  }

  // 6. Tres últimas cifras del 1er premio
  const last3 = userNum % 1000;
  const drawLast3 = drawMainNum % 1000;
  if (last3 === drawLast3) {
    return {
      hasWon: true,
      category: 'Tres Últimas Cifras (1er Premio)',
      prizeAmount: '€ 30 al Décimo (300 € Billete)',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain: main.slice(2),
      matchedExtra: [],
      description: `Las 3 últimas cifras [${last3.toString().padStart(3, '0')}] coinciden con la terminación del 1er Premio.`,
    };
  }

  // 7. Extracciones de 3 cifras
  if (extracciones3.includes(last3)) {
    return {
      hasWon: true,
      category: 'Extracción de 3 Cifras',
      prizeAmount: '€ 30 al Décimo (300 € Billete)',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain: main.slice(2),
      matchedExtra: [],
      description: `Las 3 últimas cifras [${last3.toString().padStart(3, '0')}] coinciden con una de las extracciones oficiales de 3 cifras.`,
    };
  }

  // 8. Centena del Primer Premio (3 primeras cifras)
  const first3 = Math.floor(userNum / 100);
  const drawFirst3 = Math.floor(drawMainNum / 100);
  if (first3 === drawFirst3) {
    return {
      hasWon: true,
      category: 'Centena del 1er Premio',
      prizeAmount: '€ 30 al Décimo',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain: main.slice(0, 3),
      matchedExtra: [],
      description: `Las 3 primeras cifras [${first3}] coinciden con la centena del Primer Premio.`,
    };
  }

  // 9. Centena del Segundo Premio (3 primeras cifras)
  const drawSegFirst3 = Math.floor(drawSegNum / 100);
  if (first3 === drawSegFirst3) {
    return {
      hasWon: true,
      category: 'Centena del 2º Premio',
      prizeAmount: '€ 30 al Décimo',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain: main.slice(0, 3),
      matchedExtra: [],
      description: `Las 3 primeras cifras [${first3}] coinciden con la centena del 2º Premio.`,
    };
  }

  // 10. Dos últimas cifras del 1er premio
  const last2 = userNum % 100;
  const drawLast2 = drawMainNum % 100;
  if (last2 === drawLast2) {
    return {
      hasWon: true,
      category: 'Dos Últimas Cifras (1er Premio)',
      prizeAmount: '€ 12 al Décimo (120 € Billete)',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain: main.slice(3),
      matchedExtra: [],
      description: `Las 2 últimas cifras [${last2.toString().padStart(2, '0')}] coinciden con la terminación del 1er Premio.`,
    };
  }

  // 11. Extracciones de 2 cifras
  if (extracciones2.includes(last2)) {
    return {
      hasWon: true,
      category: 'Extracción de 2 Cifras',
      prizeAmount: '€ 12 al Décimo (120 € Billete)',
      tierBadge: 'minor',
      isJackpot: false,
      matchedMain: main.slice(3),
      matchedExtra: [],
      description: `Las 2 últimas cifras [${last2.toString().padStart(2, '0')}] coinciden con una de las extracciones oficiales de 2 cifras.`,
    };
  }

  // 12. Reintegros (última cifra coincide con los 3 reintegros oficiales)
  const lastDigit = main[4];
  if (reintegros.includes(lastDigit)) {
    return {
      hasWon: true,
      category: 'Reintegro Oficial SELAE',
      prizeAmount: '€ 6,00 al Décimo (Devolución Íntegra)',
      tierBadge: 'refund',
      isJackpot: false,
      matchedMain: [lastDigit],
      matchedExtra: [],
      description: `¡Acertaste el reintegro [${lastDigit}]! Recuperas el 100% de lo jugado en tu décimo de Lotería Nacional.`,
    };
  }

  return {
    hasWon: false,
    category: 'Sin Premio en este Sorteo',
    prizeAmount: '€ 0',
    tierBadge: 'none',
    isJackpot: false,
    matchedMain: [],
    matchedExtra: [],
    description: `Tu décimo [${userNumStr}] Serie ${userSerie} no obtuvo premio mayor, aproximación, centena, terminación ni reintegro en el sorteo auditado.`,
  };
}
