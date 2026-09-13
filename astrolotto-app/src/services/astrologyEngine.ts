import type { AstroInfluence } from '../types/lottery';

// Synodic lunar month in days
const SYNODIC_MONTH = 29.53058867;
// Reference known New Moon: Jan 6, 2000 18:14 UTC
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();

export function calculateMoonPhase(targetDateStr: string) {
  const targetDate = new Date(targetDateStr);
  const diffTime = targetDate.getTime() - KNOWN_NEW_MOON;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const cyclePosition = (diffDays % SYNODIC_MONTH + SYNODIC_MONTH) % SYNODIC_MONTH;
  const phaseNormalized = cyclePosition / SYNODIC_MONTH; // 0 to 1

  let name = '';
  let icon = '🌑';
  let significance = '';
  let illumination = Math.round((1 - Math.cos(phaseNormalized * 2 * Math.PI)) / 2 * 100);

  if (phaseNormalized < 0.03 || phaseNormalized > 0.97) {
    name = 'Luna Nueva (Novilunio)';
    icon = '🌑';
    significance = 'Momento de siembra, reinicio de ciclos y emergencia de números rezagados (fríos).';
  } else if (phaseNormalized < 0.22) {
    name = 'Luna Creciente';
    icon = '🌒';
    significance = 'Crecimiento de energía, propicio para números en tendencia ascendente y favoritos.';
  } else if (phaseNormalized < 0.28) {
    name = 'Cuarto Creciente';
    icon = '🌓';
    significance = 'Punto de inflexión y equilibrio entre números pares e impares con alta tracción.';
  } else if (phaseNormalized < 0.47) {
    name = 'Gibosa Creciente';
    icon = '🌔';
    significance = 'Acumulación de energía cuántica, favorece secuencias armónicas y números maestros.';
  } else if (phaseNormalized < 0.53) {
    name = 'Luna Llena (Plenilunio)';
    icon = '🌕';
    significance = 'Máxima iluminación psíquica y manifestación de números de alta vibración y calientes.';
  } else if (phaseNormalized < 0.72) {
    name = 'Gibosa Menguante';
    icon = '🌖';
    significance = 'Consolidación de frecuencias kármicas y liberación de números estancados.';
  } else if (phaseNormalized < 0.78) {
    name = 'Cuarto Menguante';
    icon = '🌗';
    significance = 'Limpieza de secuencias repetitivas, favorece dispersión uniforme y combinaciones raras.';
  } else {
    name = 'Luna Balsámica (Menguante final)';
    icon = '🌘';
    significance = 'Intuición profunda, cierre de octavas celestes y números sorpresa de baja expectativa.';
  }

  return { name, illumination, significance, icon };
}

export function getDominantPlanetForDate(dateStr: string) {
  const d = new Date(dateStr);
  const dayOfWeek = d.getDay(); // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday

  const PLANETARY_RULERS = [
    { name: 'Sol', symbol: '☉', energy: 'Claridad, realeza, magnetismo primordial', resonantNumbers: [1, 10, 19, 28, 37, 46, 55] },
    { name: 'Luna', symbol: '☽', energy: 'Intuición receptiva, mareas cuánticas y sueños', resonantNumbers: [2, 11, 20, 29, 38, 47] },
    { name: 'Marte', symbol: '♂', energy: 'Fuerza impulsora, ruptura de patrones y azar activo', resonantNumbers: [9, 18, 27, 36, 45, 54] },
    { name: 'Mercurio', symbol: '☿', energy: 'Velocidad mental, cálculo combinatorio y sincronicidad', resonantNumbers: [5, 14, 23, 32, 41, 50] },
    { name: 'Júpiter', symbol: '♃', energy: 'Expansión de la fortuna, gracia mayor y abundancia', resonantNumbers: [3, 12, 21, 30, 39, 48] },
    { name: 'Venus', symbol: '♀', energy: 'Atracción armónica, proporción áurea y belleza matemática', resonantNumbers: [6, 15, 24, 33, 42, 51] },
    { name: 'Saturno', symbol: '♄', energy: 'Estructura inquebrantable, números con retraso kármico', resonantNumbers: [8, 17, 26, 35, 44, 53] },
  ];

  // Map 0:Sun, 1:Moon, 2:Mars, 3:Mercury, 4:Jupiter, 5:Venus, 6:Saturn
  return PLANETARY_RULERS[dayOfWeek];
}

export function getZodiacSign(birthDateStr: string): { sign: string; element: 'Fuego' | 'Tierra' | 'Aire' | 'Agua'; luckyHarmony: string } {
  const d = new Date(birthDateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { sign: 'Aries', element: 'Fuego', luckyHarmony: 'Impulso audaz (Números 9, 18, 27, 36)' };
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { sign: 'Tauro', element: 'Tierra', luckyHarmony: 'Constancia material (Números 6, 15, 24, 33)' };
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { sign: 'Géminis', element: 'Aire', luckyHarmony: 'Sincronicidad ágil (Números 5, 14, 23, 32)' };
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { sign: 'Cáncer', element: 'Agua', luckyHarmony: 'Vibración intuitiva (Números 2, 7, 11, 20)' };
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { sign: 'Leo', element: 'Fuego', luckyHarmony: 'Corona solar (Números 1, 10, 19, 28)' };
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { sign: 'Virgo', element: 'Tierra', luckyHarmony: 'Geometría analítica (Números 5, 14, 32, 41)' };
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { sign: 'Libra', element: 'Aire', luckyHarmony: 'Proporción equilibrada (Números 6, 15, 24, 42)' };
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { sign: 'Escorpio', element: 'Agua', luckyHarmony: 'Intensidad cuántica (Números 8, 9, 18, 27)' };
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { sign: 'Sagitario', element: 'Fuego', luckyHarmony: 'Flecha de la fortuna (Números 3, 12, 21, 30)' };
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return { sign: 'Capricornio', element: 'Tierra', luckyHarmony: 'Solidez y paciencia (Números 4, 8, 17, 26)' };
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { sign: 'Acuario', element: 'Aire', luckyHarmony: 'Ruptura visionaria (Números 4, 7, 11, 22)' };
  } else {
    return { sign: 'Piscis', element: 'Agua', luckyHarmony: 'Resonancia cósmica (Números 3, 7, 12, 25)' };
  }
}

export function computeAstroInfluence(drawDateStr: string, birthDateStr: string): AstroInfluence {
  const moonPhase = calculateMoonPhase(drawDateStr);
  const dominantPlanet = getDominantPlanetForDate(drawDateStr);
  const zodiacAspect = getZodiacSign(birthDateStr);

  // Celestial vibration 1-9
  const d = new Date(drawDateStr);
  const seed = d.getFullYear() + d.getMonth() + 1 + d.getDate() + moonPhase.illumination;
  const celestialVibration = (seed % 9) || 9;

  return {
    moonPhase,
    dominantPlanet,
    zodiacAspect,
    celestialVibration,
  };
}
