import type { NumerologyBreakdown } from '../types/lottery';

export function sumDigits(num: number): number {
  return num
    .toString()
    .split('')
    .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
}

export function reduceToSingleOrMaster(num: number): number {
  let current = num;
  while (current > 9 && current !== 11 && current !== 22 && current !== 33) {
    current = sumDigits(current);
  }
  return current;
}

export function calculateLifePathNumber(birthDateStr: string): number {
  if (!birthDateStr) return 7; // default mystical fallback
  const parts = birthDateStr.split('-').map((p) => parseInt(p, 10));
  if (parts.length < 3 || parts.some(isNaN)) return 7;

  const [year, month, day] = parts;
  const reducedYear = reduceToSingleOrMaster(year);
  const reducedMonth = reduceToSingleOrMaster(month);
  const reducedDay = reduceToSingleOrMaster(day);

  return reduceToSingleOrMaster(reducedYear + reducedMonth + reducedDay);
}

export function calculateUniversalDayVibration(drawDateStr: string): number {
  if (!drawDateStr) return 9;
  const parts = drawDateStr.split('-').map((p) => parseInt(p, 10));
  if (parts.length < 3 || parts.some(isNaN)) return 9;

  const [year, month, day] = parts;
  const total = year + month + day;
  return reduceToSingleOrMaster(total);
}

export function calculatePersonalDayNumber(birthDateStr: string, drawDateStr: string): number {
  const lifePath = calculateLifePathNumber(birthDateStr);
  const univDay = calculateUniversalDayVibration(drawDateStr);
  return reduceToSingleOrMaster(lifePath + univDay);
}

export function computeNumerologyBreakdown(birthDateStr: string, drawDateStr: string): NumerologyBreakdown {
  const lifePath = calculateLifePathNumber(birthDateStr);
  const universalDayVibration = calculateUniversalDayVibration(drawDateStr);
  const personalDayNumber = calculatePersonalDayNumber(birthDateStr, drawDateStr);

  const masterNumbersPresent: number[] = [];
  if ([11, 22, 33].includes(lifePath)) masterNumbersPresent.push(lifePath);
  if ([11, 22, 33].includes(universalDayVibration)) masterNumbersPresent.push(universalDayVibration);

  // Generate a resonant matrix of numbers connected to these root vibrations
  const bases = [lifePath, universalDayVibration, personalDayNumber];
  const matrixSet = new Set<number>();

  bases.forEach((base) => {
    const root = base > 9 ? sumDigits(base) : base;
    for (let mult = 1; mult <= 8; mult++) {
      const val = root * mult;
      if (val <= 50) matrixSet.add(val);
      // Pythagorean mirror
      const mirror = root + (mult * 9);
      if (mirror <= 50) matrixSet.add(mirror);
    }
  });

  return {
    lifePath,
    universalDayVibration,
    personalDayNumber,
    masterNumbersPresent,
    harmoniousMatrix: Array.from(matrixSet).sort((a, b) => a - b),
  };
}
